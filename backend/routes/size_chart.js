import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all size charts
router.get("/", (req, res) => {
    const listSql = "SELECT * FROM size_charts ORDER BY id DESC";
    db.query(listSql, (err, charts) => {
        if (err) return res.status(500).json({ error: err.message });

        const detailSql = `
            SELECT sc.id, sc.chart_name, GROUP_CONCAT(scv.size_value ORDER BY scv.id SEPARATOR ', ') as size_values 
            FROM size_charts sc 
            LEFT JOIN size_chart_values scv ON sc.id = scv.size_chart_id 
            GROUP BY sc.id 
            ORDER BY sc.id DESC
        `;

        db.query(detailSql, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    });
});

// GET specific size chart details
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM size_charts WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Size chart not found" });

        const chart = results[0];
        const valuesSql = "SELECT * FROM size_chart_values WHERE size_chart_id = ? ORDER BY id ASC";
        db.query(valuesSql, [id], (err, values) => {
            if (err) return res.status(500).json({ error: err.message });
            chart.values = values;
            res.json(chart);
        });
    });
});

// CREATE new size chart
router.post("/", (req, res) => {
    const { chart_name, values } = req.body;

    if (!chart_name || !values || !Array.isArray(values) || values.length === 0) {
        return res.status(400).json({ error: "Chart name and at least one size value are required" });
    }

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: "Database connection failed" });

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: err.message });
            }

            const chartSql = "INSERT INTO size_charts (chart_name) VALUES (?)";
            connection.query(chartSql, [chart_name], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({ error: "Size chart name already exists" });
                        }
                        res.status(500).json({ error: err.message });
                    });
                }

                const chartId = result.insertId;
                const valuesSql = "INSERT INTO size_chart_values (size_chart_id, size_value) VALUES ?";
                const valuesData = values.map(val => [chartId, val]);

                connection.query(valuesSql, [valuesData], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }

                    connection.commit(err => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: err.message });
                            });
                        }
                        connection.release();
                        res.status(201).json({ message: "Size chart created successfully", id: chartId });
                    });
                });
            });
        });
    });
});

// UPDATE size chart
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { chart_name, values } = req.body;

    if (!chart_name || !values || !Array.isArray(values) || values.length === 0) {
        return res.status(400).json({ error: "Chart name and at least one size value are required" });
    }

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: "Database connection failed" });

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: err.message });
            }

            const updateChartSql = "UPDATE size_charts SET chart_name = ? WHERE id = ?";
            connection.query(updateChartSql, [chart_name, id], (err) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({ error: "Size chart name already exists" });
                        }
                        res.status(500).json({ error: err.message });
                    });
                }

                const deleteValuesSql = "DELETE FROM size_chart_values WHERE size_chart_id = ?";
                connection.query(deleteValuesSql, [id], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }

                    const valuesSql = "INSERT INTO size_chart_values (size_chart_id, size_value) VALUES ?";
                    const valuesData = values.map(val => [id, val]);

                    connection.query(valuesSql, [valuesData], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: err.message });
                            });
                        }

                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: err.message });
                                });
                            }
                            connection.release();
                            res.json({ message: "Size chart updated successfully" });
                        });
                    });
                });
            });
        });
    });
});

// DELETE size chart
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    // Values will be deleted automatically due to ON DELETE CASCADE
    const sql = "DELETE FROM size_charts WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Size chart not found" });
        res.json({ message: "Size chart deleted successfully" });
    });
});

export default router;
