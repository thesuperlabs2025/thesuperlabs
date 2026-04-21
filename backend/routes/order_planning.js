import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";
import { automateOrderToMaster } from "../automation.js";

const router = express.Router();

// Setup Multer for order images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `order_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Get next order number
router.get("/next-order-no", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const query = "SELECT MAX(id) as maxId FROM order_planning WHERE year_id = ?";
    db.query(query, [yearId], (err, data) => {
        if (err) return res.status(500).json(err);
        const nextId = (data[0].maxId || 0) + 1;
        res.status(200).json({ orderNo: String(nextId) });
    });
});

// Get all orders with filtering
router.get("/", (req, res) => {
    const yearId = req.headers['x-year-id'];
    const { order_no, buyer_name, season_name, merchandiser_name, status, page = 1, limit = 20 } = req.query;
    let query = "SELECT * FROM order_planning WHERE year_id = ?";
    let params = [yearId];

    if (order_no) {
        query += " AND order_no LIKE ?";
        params.push(`%${order_no}%`);
    }
    if (buyer_name) {
        query += " AND buyer_name LIKE ?";
        params.push(`%${buyer_name}%`);
    }
    if (season_name) {
        query += " AND season_name LIKE ?";
        params.push(`%${season_name}%`);
    }
    if (merchandiser_name) {
        query += " AND merchandiser_name LIKE ?";
        params.push(`%${merchandiser_name}%`);
    }
    if (status) {
        query += " AND status = ?";
        params.push(status);
    } else if (req.query.exclude_completed === 'true') {
        query += " AND status != 'Completed'";
    }

    query += " ORDER BY id DESC";

    const offset = (page - 1) * limit;
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as total");

    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    db.query(countQuery, params.slice(0, -2), (err, countResult) => {
        if (err) return res.status(500).json(err);

        db.query(query, params, (err, data) => {
            if (err) {
                console.error("Error fetching filtered order_planning:", err);
                return res.status(500).json(err);
            }

            const total = countResult[0].total;
            res.status(200).json({
                data,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            });
        });
    });
});

// Get single order
router.get("/:id", (req, res) => {
    const query = "SELECT * FROM order_planning WHERE id = ?";
    db.query(query, [req.params.id], (err, data) => {
        if (err) {
            console.error("Error fetching single order_planning:", err);
            return res.status(500).json(err);
        }
        if (data.length === 0) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(data[0]);
    });
});

// Save/Create order
router.post("/", upload.single("order_image"), (req, res) => {
    const yearId = req.headers['x-year-id'];
    const q = `INSERT INTO order_planning 
        (order_no, order_type, own_brand_name, buyer_id, buyer_name, buyer_po, order_name, order_category, style_type, season_id, season_name, merchandiser_id, merchandiser_name, priority, order_date, factory_date, delivery_date, lifecycle_type, is_bundle, order_image, status, year_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const orderImage = req.file ? req.file.filename : null;

    const values = [
        req.body.orderNo,
        req.body.orderType,
        req.body.ownBrandName || null,
        req.body.buyerId || null,
        req.body.buyerName || null,
        req.body.buyerPo || null,
        req.body.orderName || null,
        req.body.orderCategory,
        req.body.styleType || 'new style planning',
        req.body.seasonId || null,
        req.body.seasonName || null,
        req.body.merchandiserId || null,
        req.body.merchandiserName || null,
        req.body.priority,
        req.body.orderDate || null,
        req.body.factoryDate || null,
        req.body.deliveryDate || null,
        req.body.lifecycleType,
        req.body.isBundle,
        orderImage,
        req.body.status || "Pending",
        yearId
    ];

    db.query(q, values, (err, data) => {
        if (err) {
            console.error("Error inserting order_planning:", err);
            return res.status(500).json(err);
        }
        res.status(201).json({ message: "Order created successfully", id: data.insertId });
    });
});

// Update order
router.put("/:id", upload.single("order_image"), (req, res) => {
    let q = `UPDATE order_planning SET 
        order_type=?, own_brand_name=?, buyer_id=?, buyer_name=?, buyer_po=?, order_name=?, order_category=?, style_type=?, season_id=?, season_name=?, merchandiser_id=?, merchandiser_name=?, priority=?, order_date=?, factory_date=?, delivery_date=?, lifecycle_type=?, is_bundle=?, status=?`;

    let values = [
        req.body.orderType,
        req.body.ownBrandName || null,
        req.body.buyerId || null,
        req.body.buyerName || null,
        req.body.buyerPo || null,
        req.body.orderName || null,
        req.body.orderCategory,
        req.body.styleType || 'new style planning',
        req.body.seasonId || null,
        req.body.seasonName || null,
        req.body.merchandiserId || null,
        req.body.merchandiserName || null,
        req.body.priority,
        req.body.orderDate || null,
        req.body.factoryDate || null,
        req.body.deliveryDate || null,
        req.body.lifecycleType,
        req.body.isBundle,
        req.body.status
    ];

    if (req.file) {
        q += ", order_image = ?";
        values.push(req.file.filename);
    }

    q += " WHERE id = ?";
    values.push(req.params.id);

    db.query(q, values, (err, data) => {
        if (err) {
            console.error("Error updating order_planning:", err);
            return res.status(500).json(err);
        }

        // Trigger automation if approved
        if (req.body.status === 'Approved') {
            automateOrderToMaster(req.params.id);
        }

        res.status(200).json({ message: "Order updated successfully" });
    });
});

// Delete order
router.delete("/:id", (req, res) => {
    const orderId = req.params.id;

    // Use a transaction or sequential deletes to clean up child records
    // Delete size_quantity_items first (via size_quantity join)
    const q1 = "DELETE FROM size_quantity_items WHERE size_quantity_id IN (SELECT id FROM size_quantity WHERE order_id = ?)";
    const q2 = "DELETE FROM size_quantity WHERE order_id = ?";
    const q3 = "DELETE FROM order_planning WHERE id = ?";

    db.query(q1, [orderId], (err) => {
        if (err) return res.status(500).json(err);
        db.query(q2, [orderId], (err) => {
            if (err) return res.status(500).json(err);
            db.query(q3, [orderId], (err, data) => {
                if (err) return res.status(500).json(err);
                res.status(200).json({ message: "Order and associated data deleted successfully" });
            });
        });
    });
});

export default router;
