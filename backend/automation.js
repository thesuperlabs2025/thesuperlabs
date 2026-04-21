import db from "./db.js";

/**
 * Automatically creates Style Planning and Master Data (Fabrics, Yarn, Trims)
 * when an order is Approved.
 */
export const automateOrderToMaster = async (orderId) => {
    try {
        console.log(`\x1b[36m🚀 Starting automation for Order ID: ${orderId}\x1b[0m`);

        // 1. Fetch Order Details
        const [orders] = await db.promise().query("SELECT * FROM order_planning WHERE id = ?", [orderId]);
        if (orders.length === 0) {
            console.error(`❌ Order ${orderId} not found.`);
            return;
        }
        const order = orders[0];

        const styleName = order.order_name || order.order_no;
        const styleColor = "";

        // 2. Fetch Size Quantity
        const [sizeQty] = await db.promise().query("SELECT * FROM size_quantity WHERE order_id = ?", [orderId]);
        const sizeChartId = sizeQty.length > 0 ? sizeQty[0].size_chart_id : null;
        let sizeChartName = "";
        if (sizeChartId) {
            const [charts] = await db.promise().query("SELECT chart_name FROM size_charts WHERE id = ?", [sizeChartId]);
            if (charts.length > 0) sizeChartName = charts[0].chart_name;
        }

        // 3. Style Planning Creation
        let styleId;
        const [existingStyle] = await db.promise().query("SELECT id FROM style_planning WHERE style_name = ?", [styleName]);

        if (existingStyle.length > 0) {
            styleId = existingStyle[0].id;
            console.log(`\x1b[33mℹ️ Style Planning already exists for "${styleName}" (ID: ${styleId}). Checking planning data...\x1b[0m`);

            const [existingFabrics] = await db.promise().query("SELECT id FROM style_fabrics WHERE style_id = ?", [styleId]);
            if (existingFabrics.length > 0) {
                console.log(`\x1b[33mℹ️ Style already has planning data. Syncing Master Data and skipping sub-creation.\x1b[0m`);
                await createMasterData(orderId, sizeChartId);
                return;
            }
        } else {
            const [lifecycle] = await db.promise().query("SELECT * FROM order_lifecycle WHERE order_id = ?", [orderId]);
            const [styleResult] = await db.promise().query(
                "INSERT INTO style_planning (style_name, style_color, size_chart_id, size_chart_name, life_cycle) VALUES (?, ?, ?, ?, ?)",
                [styleName, styleColor, sizeChartId, sizeChartName, JSON.stringify(lifecycle)]
            );
            styleId = styleResult.insertId;
            console.log(`\x1b[32m✅ Created Style Planning: "${styleName}" (ID: ${styleId})\x1b[0m`);
        }

        if (!styleId) return;

        // 4. Populate Style Planning Sub-Tables

        // A. Fabrics (Track new IDs for Yarn linking)
        const fabricIdMap = {}; // Key: fabric_name, Value: new style_fabric_id
        try {
            const [fabrics] = await db.promise().query(`
                SELECT fpi.* FROM fabric_planning_items fpi
                JOIN fabric_planning fp ON fpi.fabric_planning_id = fp.id
                WHERE fp.order_id = ?
            `, [orderId]);

            if (fabrics.length > 0) {
                for (const f of fabrics) {
                    const sku = [f.counts, f.fabric_name, f.gsm, f.dia, f.color].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');
                    let sizeData = f.consumption_data;
                    if (typeof sizeData !== 'string') sizeData = JSON.stringify(sizeData || {});

                    const [res] = await db.promise().query(`
                        INSERT INTO style_fabrics 
                        (style_id, style_part, fabric_sku, fabric_name, body_part, counts, dia_chart_id, dia_data, size_data, avg_weight, gsm, dia, color, composition, fabric_type)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        styleId, f.style_part || 'Top', sku, f.fabric_name, f.body_part || 'Body', f.counts || "", null, '{}', sizeData, f.avg_wt || 0, f.gsm || "", f.dia || "", f.color || "", f.composition || "", "Fabric"
                    ]);

                    // Store the mapping for yarn linking
                    fabricIdMap[f.fabric_name] = res.insertId;
                }
                console.log(`\x1b[32m✅ Synced ${fabrics.length} Fabric items to Style Planning.\x1b[0m`);
            }
        } catch (err) { console.error("❌ Error syncing Style Fabrics:", err.message); }

        // B. Yarns (Linked to new Style Fabric IDs)
        try {
            const [yarns] = await db.promise().query("SELECT * FROM yarn_planning WHERE order_id = ?", [orderId]);
            if (yarns.length > 0) {
                for (const y of yarns) {
                    const fabricSku = y.fabric_sku || y.fabric_name.toLowerCase().replace(/\s+/g, '-');
                    const linkedFabricId = fabricIdMap[y.fabric_name] || null;

                    await db.promise().query(`
                        INSERT INTO style_yarns 
                        (style_id, fabric_id_ref, fabric_sku, fabric_name, yarn_counts, yarn_name, yarn_color, consumption)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        styleId, linkedFabricId, fabricSku, y.fabric_name, y.yarn_counts || "", y.yarn_name, y.yarn_color || "", y.consumption || 0
                    ]);
                }
                console.log(`\x1b[32m✅ Synced ${yarns.length} Yarn items to Style Planning with fabric links.\x1b[0m`);
            }
        } catch (err) { console.error("❌ Error syncing Style Yarns:", err.message); }

        // C. Trims
        try {
            const [trims] = await db.promise().query("SELECT * FROM trims_planning WHERE order_id = ?", [orderId]);
            if (trims.length > 0) {
                for (const t of trims) {
                    const sku = [t.trims_name, t.color].filter(p => p && p !== "").join('-').replace(/\s+/g, '-');
                    let sizeData = t.consumption_data;
                    if (typeof sizeData !== 'string') sizeData = JSON.stringify(sizeData || {});

                    await db.promise().query(`
                        INSERT INTO style_trims 
                        (style_id, trims_name, trims_sku, is_sizable, size_data, color)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [
                        styleId, t.trims_name, sku, t.trim_type === 'Sizable' ? "Sizable" : "Non-Sizable", sizeData, t.color || ""
                    ]);
                }
                console.log(`\x1b[32m✅ Synced ${trims.length} Trim items to Style Planning.\x1b[0m`);
            }
        } catch (err) { console.error("❌ Error syncing Style Trims:", err.message); }

        // 5. Create Master Stock Data
        await createMasterData(orderId, sizeChartId);

        console.log(`\x1b[36m✨ Automation completed successfully for Order ID: ${orderId}\x1b[0m`);
    } catch (err) {
        console.error("\x1b[31m❌ Global Automation Error:\x1b[0m", err);
    }
};

const createMasterData = async (orderId, sizeChartId) => {
    // Fabric Master
    try {
        const [fabrics] = await db.promise().query(`
            SELECT fpi.* FROM fabric_planning_items fpi
            JOIN fabric_planning fp ON fpi.fabric_planning_id = fp.id
            WHERE fp.order_id = ?
        `, [orderId]);

        for (const f of fabrics) {
            const sku = [f.counts, f.fabric_name, f.gsm, f.dia, f.color].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');
            const [exists] = await db.promise().query("SELECT id FROM fabrics WHERE fabric_sku = ?", [sku]);
            if (exists.length === 0) {
                await db.promise().query(
                    "INSERT INTO fabrics (fabric_sku, counts, fabric_name, gsm, dia, color, composition) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [sku, f.counts || "", f.fabric_name, f.gsm || "", f.dia || "", f.color || "", f.composition || ""]
                );
                console.log(`\x1b[32m📦 Created Master Fabric: ${sku}\x1b[0m`);
            }
        }
    } catch (err) { console.error("❌ Error creating Master Fabrics:", err.message); }

    // Yarn Master
    try {
        const [yarns] = await db.promise().query("SELECT * FROM yarn_planning WHERE order_id = ?", [orderId]);
        for (const y of yarns) {
            const sku = [y.yarn_counts, y.yarn_name, y.yarn_color].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');
            const [exists] = await db.promise().query("SELECT id FROM yarn WHERE yarn_sku = ?", [sku]);
            if (exists.length === 0) {
                await db.promise().query(
                    "INSERT INTO yarn (yarn_sku, yarn_name, counts, color) VALUES (?, ?, ?, ?)",
                    [sku, y.yarn_name, y.yarn_counts || "", y.yarn_color || ""]
                );
                console.log(`\x1b[32m📦 Created Master Yarn: ${sku}\x1b[0m`);
            }
        }
    } catch (err) { console.error("❌ Error creating Master Yarn:", err.message); }

    // Trims Master
    try {
        const [trims] = await db.promise().query("SELECT * FROM trims_planning WHERE order_id = ?", [orderId]);
        for (const t of trims) {
            const isSizable = t.trim_type === 'Sizable';
            if (isSizable) {
                const consData = typeof t.consumption_data === 'string' ? JSON.parse(t.consumption_data) : t.consumption_data;
                for (const [size, val] of Object.entries(consData || {})) {
                    if (!size || size === 'undefined' || size === 'null') continue;
                    const cleanSize = size.trim().toLowerCase().replace(/\s+/g, '-');
                    const sku = [t.trims_name, t.color, cleanSize].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');
                    const [exists] = await db.promise().query("SELECT id FROM trims WHERE trims_sku = ?", [sku]);
                    if (exists.length === 0) {
                        await db.promise().query(
                            "INSERT INTO trims (trims_sku, trims_name, color, is_sizable, uom, size_chart_id) VALUES (?, ?, ?, ?, ?, ?)",
                            [sku, t.trims_name, t.color || "", 1, 'Pcs', sizeChartId]
                        );
                        console.log(`\x1b[32m📦 Created Master Trim (Sizable): ${sku}\x1b[0m`);
                    }
                }
            } else {
                const sku = [t.trims_name, t.color].filter(Boolean).join('-').toLowerCase().replace(/\s+/g, '-');
                const [exists] = await db.promise().query("SELECT id FROM trims WHERE trims_sku = ?", [sku]);
                if (exists.length === 0) {
                    await db.promise().query(
                        "INSERT INTO trims (trims_sku, trims_name, color, is_sizable, uom) VALUES (?, ?, ?, ?, ?)",
                        [sku, t.trims_name, t.color || "", 0, 'Pcs']
                    );
                    console.log(`\x1b[32m📦 Created Master Trim: ${sku}\x1b[0m`);
                }
            }
        }
    } catch (err) { console.error("❌ Error creating Master Trims:", err.message); }
};
