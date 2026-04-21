import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Setup Multer for style images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `style_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Get all styles
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = "SELECT * FROM style_planning WHERE year_id = ? ORDER BY id DESC";
    db.query(q, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(data);
    });
});

// Check fabric usage by SKU
router.get("/fabric-usage/check", (req, res) => {
    const q = "SELECT fabric_sku, GROUP_CONCAT(DISTINCT style_id) as style_ids FROM style_fabrics GROUP BY fabric_sku";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(data);
    });
});

// Get single style with all details
router.get("/:id", (req, res) => {
    const styleId = req.params.id;
    const qStyle = "SELECT * FROM style_planning WHERE id = ?";
    const qFabrics = "SELECT * FROM style_fabrics WHERE style_id = ?";
    const qYarns = "SELECT * FROM style_yarns WHERE style_id = ?";
    const qTrims = "SELECT * FROM style_trims WHERE style_id = ?";

    db.query(qStyle, [styleId], (err, styleData) => {
        if (err) return res.status(500).json(err);
        if (styleData.length === 0) return res.status(404).json("Style not found");

        db.query(qFabrics, [styleId], (err, fabricsData) => {
            if (err) return res.status(500).json(err);

            db.query(qYarns, [styleId], (err, yarnsData) => {
                if (err) return res.status(500).json(err);

                db.query(qTrims, [styleId], (err, trimsData) => {
                    if (err) return res.status(500).json(err);

                    res.status(200).json({
                        ...styleData[0],
                        fabrics: fabricsData,
                        yarns: yarnsData,
                        trims: trimsData
                    });
                });
            });
        });
    });
});

// Helper to sync master tables
const syncMasterTables = async (fabrics, yarns, trims) => {
    try {
        // 1. Sync Fabrics
        if (fabrics && fabrics.length > 0) {
            for (const f of fabrics) {
                if (!f.fabricSku) continue;
                const [exists] = await db.promise().query("SELECT id FROM fabrics WHERE fabric_sku = ?", [f.fabricSku]);
                if (exists.length === 0) {
                    await db.promise().query(
                        "INSERT INTO fabrics (fabric_sku, fabric_name, counts, dia_chart_id, dia_data, gsm, dia, color, composition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [f.fabricSku, f.fabricName, f.counts || "", f.diaChartId || null, JSON.stringify(f.diaData || {}), f.gsm || "", f.dia || "", f.color || "", f.composition || ""]
                    );
                } else {
                    await db.promise().query(
                        "UPDATE fabrics SET counts = ?, dia_chart_id = ?, dia_data = ?, gsm = ?, dia = ?, color = ?, composition = ? WHERE fabric_sku = ?",
                        [f.counts || "", f.diaChartId || null, JSON.stringify(f.diaData || {}), f.gsm || "", f.dia || "", f.color || "", f.composition || "", f.fabricSku]
                    );
                }
            }
        }

        // 2. Sync Yarns
        if (yarns && yarns.length > 0) {
            for (const y of yarns) {
                if (!y.yarnName) continue;
                // Generate SKU: counts-yarnName-color
                const yarnSku = y.yarnSku || [y.yarnCounts, y.yarnName, y.yarnColor].filter(p => p && p !== "").join('-').replace(/\s+/g, '-');
                const [exists] = await db.promise().query("SELECT id FROM yarn WHERE yarn_name = ? AND counts = ? AND color = ?", [y.yarnName, y.yarnCounts, y.yarnColor]);
                if (exists.length === 0) {
                    await db.promise().query(
                        "INSERT INTO yarn (yarn_sku, yarn_name, counts, color) VALUES (?, ?, ?, ?)",
                        [yarnSku, y.yarnName, y.yarnCounts || "", y.yarnColor || ""]
                    );
                }
            }
        }

        // 3. Sync Trims
        if (trims && trims.length > 0) {
            for (const t of trims) {
                if (!t.trimsName) continue;

                const isSizable = t.isSizable === "Sizable" || t.isSizable === true; // Handle both string and boolean

                if (isSizable && t.sizeData) {
                    // For sizable trims, we need to create a SKU for EACH size that has a value
                    for (const [size, value] of Object.entries(t.sizeData)) {
                        // Value check might be optional depending on if we want to create SKUs for all sizes or only used ones
                        // Assuming we create for all defined sizes in the chart to be safe

                        // Generate SKU: trimsName-color-size
                        const cleanSize = size.replace(/\s+/g, '');
                        const trimsSku = [t.trimsName, t.color, cleanSize].filter(p => p && p !== "").join('-').replace(/\s+/g, '-');

                        const [exists] = await db.promise().query("SELECT id FROM trims WHERE trims_sku = ?", [trimsSku]);
                        if (exists.length === 0) {
                            await db.promise().query(
                                "INSERT INTO trims (trims_sku, trims_name, color, is_sizable, uom) VALUES (?, ?, ?, ?, ?)",
                                [trimsSku, t.trimsName, t.color || "", 1, "Pcs"]
                            );
                        }
                    }
                } else {
                    // Non-sizable logic (existing)
                    const trimsSku = t.trimsSku || [t.trimsName, t.color].filter(p => p && p !== "").join('-').replace(/\s+/g, '-');
                    const [exists] = await db.promise().query("SELECT id FROM trims WHERE trims_sku = ?", [trimsSku]);
                    if (exists.length === 0) {
                        await db.promise().query(
                            "INSERT INTO trims (trims_sku, trims_name, color, is_sizable, uom) VALUES (?, ?, ?, ?, ?)",
                            [trimsSku, t.trimsName, t.color || "", 0, "Pcs"]
                        );
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error syncing master tables:", err);
    }
};

// Create new style
router.post("/", upload.single("style_image"), async (req, res) => {
    const { styleName, styleColor, sizeChartId, sizeChartName, fabrics, yarns, trims, lifeCycle, averageWeight } = JSON.parse(req.body.data || '{}');

    try {
        // Sync with master tables first
        await syncMasterTables(fabrics, yarns, trims);

        const styleImage = req.file ? req.file.filename : null;
        const yearId = req.headers['x-year-id'];
        const qStyle = "INSERT INTO style_planning (style_name, style_color, size_chart_id, size_chart_name, life_cycle, average_weight, style_image, year_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const styleValues = [styleName, styleColor, sizeChartId, sizeChartName, JSON.stringify(lifeCycle), averageWeight || 0, styleImage, yearId];

        const [styleResult] = await db.promise().query(qStyle, styleValues);
        const styleId = styleResult.insertId;

        // Insert Fabrics and track IDs
        const fabricIdMap = {};
        if (fabrics && fabrics.length > 0) {
            const qFabric = "INSERT INTO style_fabrics (style_id, style_part, fabric_sku, fabric_name, body_part, counts, dia_chart_id, dia_data, size_data, avg_weight, gsm, dia, color, composition, fabric_type) VALUES ?";
            const fabricValues = fabrics.map(f => [
                styleId, f.stylePart, f.fabricSku || "", f.fabricName, f.bodyPart, f.counts || "", f.diaChartId || null, JSON.stringify(f.diaData || {}), JSON.stringify(f.sizeData), f.avgWeight || 0, f.gsm, f.dia, f.color, f.composition, f.fabricType
            ]);
            await db.promise().query(qFabric, [fabricValues]);

            // Query back to get IDs
            const [newFabrics] = await db.promise().query("SELECT id, fabric_sku FROM style_fabrics WHERE style_id = ?", [styleId]);
            newFabrics.forEach(f => {
                fabricIdMap[f.fabric_sku] = f.id;
            });
        }

        // Insert Yarns with mapped fabric IDs
        if (yarns && yarns.length > 0) {
            const qYarn = "INSERT INTO style_yarns (style_id, fabric_id_ref, fabric_sku, fabric_name, yarn_counts, yarn_name, yarn_color, consumption) VALUES ?";
            const yarnValues = yarns.map(y => {
                // If fabricId matches a frontend temporary ID, try to find the new DB ID by SKU
                const mappedId = fabricIdMap[y.fabricSku] || null;
                return [
                    styleId, mappedId, y.fabricSku || "", y.fabricName, y.yarnCounts, y.yarnName, y.yarnColor, y.yarnConsumption
                ];
            });
            await db.promise().query(qYarn, [yarnValues]);
        }

        // Insert Trims
        if (trims && trims.length > 0) {
            const qTrim = "INSERT INTO style_trims (style_id, trims_name, trims_sku, is_sizable, size_data, color) VALUES ?";
            const trimValues = trims.map(t => [
                styleId, t.trimsName, t.trimsSku || [t.trimsName, t.color].filter(p => p && p !== "").join('-').replace(/\s+/g, '-'), t.isSizable, JSON.stringify(t.sizeData), t.color
            ]);
            await db.promise().query(qTrim, [trimValues]);
        }

        res.status(201).json({ message: "Style created successfully", id: styleId });
    } catch (err) {
        console.error("Error creating style:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "A style plan with this name and color already exists." });
        }
        res.status(500).json(err);
    }
});

// Update style
router.put("/:id", upload.single("style_image"), async (req, res) => {
    const styleId = req.params.id;
    const { styleName, styleColor, sizeChartId, sizeChartName, fabrics, yarns, trims, status, lifeCycle, averageWeight } = JSON.parse(req.body.data || '{}');

    try {
        // Sync with master tables first
        await syncMasterTables(fabrics, yarns, trims);

        let qUpdateStyle = "UPDATE style_planning SET style_name=?, style_color=?, size_chart_id=?, size_chart_name=?, status=?, life_cycle=?, average_weight=?";
        let styleValues = [styleName, styleColor, sizeChartId, sizeChartName, status, JSON.stringify(lifeCycle), averageWeight || 0];

        if (req.file) {
            qUpdateStyle += ", style_image=?";
            styleValues.push(req.file.filename);
        }

        qUpdateStyle += " WHERE id=?";
        styleValues.push(styleId);

        await db.promise().query(qUpdateStyle, styleValues);

        // Delete existing sub-records and re-insert
        await db.promise().query("DELETE FROM style_fabrics WHERE style_id=?", [styleId]);
        const fabricIdMap = {};
        if (fabrics && fabrics.length > 0) {
            const qFabric = "INSERT INTO style_fabrics (style_id, style_part, fabric_sku, fabric_name, body_part, counts, dia_chart_id, dia_data, size_data, avg_weight, gsm, dia, color, composition, fabric_type) VALUES ?";
            const fabricValues = fabrics.map(f => [
                styleId, f.stylePart, f.fabricSku || "", f.fabricName, f.bodyPart, f.counts || "", f.diaChartId || null, JSON.stringify(f.diaData || {}), JSON.stringify(f.sizeData), f.avgWeight || 0, f.gsm, f.dia, f.color, f.composition, f.fabricType
            ]);
            await db.promise().query(qFabric, [fabricValues]);

            // Query back to get new IDs
            const [newFabrics] = await db.promise().query("SELECT id, fabric_sku FROM style_fabrics WHERE style_id = ?", [styleId]);
            newFabrics.forEach(f => {
                fabricIdMap[f.fabric_sku] = f.id;
            });
        }

        await db.promise().query("DELETE FROM style_yarns WHERE style_id=?", [styleId]);
        if (yarns && yarns.length > 0) {
            const qYarn = "INSERT INTO style_yarns (style_id, fabric_id_ref, fabric_sku, fabric_name, yarn_counts, yarn_name, yarn_color, consumption) VALUES ?";
            const yarnValues = yarns.map(y => {
                const mappedId = fabricIdMap[y.fabricSku] || null;
                return [
                    styleId, mappedId, y.fabricSku || "", y.fabricName, y.yarnCounts, y.yarnName, y.yarnColor, y.yarnConsumption
                ];
            });
            await db.promise().query(qYarn, [yarnValues]);
        }

        await db.promise().query("DELETE FROM style_trims WHERE style_id=?", [styleId]);
        if (trims && trims.length > 0) {
            const qTrim = "INSERT INTO style_trims (style_id, trims_name, trims_sku, is_sizable, size_data, color) VALUES ?";
            const trimValues = trims.map(t => [
                styleId, t.trimsName, t.trimsSku || [t.trimsName, t.color].filter(p => p && p !== "").join('-').replace(/\s+/g, '-'), t.isSizable, JSON.stringify(t.sizeData), t.color
            ]);
            await db.promise().query(qTrim, [trimValues]);
        }

        res.status(200).json("Style updated successfully");
    } catch (err) {
        console.error("Error updating style:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "A style plan with this name and color already exists." });
        }
        res.status(500).json(err);
    }
});

// Delete style
router.delete("/:id", (req, res) => {
    const styleId = req.params.id;
    db.query("DELETE FROM style_planning WHERE id = ?", [styleId], (err) => {
        if (err) return res.status(500).json(err);
        res.status(200).json("Style deleted successfully");
    });
});

export default router;
