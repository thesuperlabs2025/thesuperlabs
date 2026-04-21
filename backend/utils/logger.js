import db from "../db.js";

/**
 * Logs an activity to the activity_logs table.
 * @param {Object} logData
 * @param {number} logData.user_id - ID of the user performing the action.
 * @param {string} logData.user_name - Name of the user performing the action.
 * @param {string} logData.action - Type of action (UPDATE, DELETE, INSERT).
 * @param {string} logData.table_name - Name of the table being modified.
 * @param {number} logData.row_id - ID of the row being modified.
 * @param {Object} [logData.old_data] - Data before modification.
 * @param {Object} [logData.new_data] - Data after modification.
 */
export const logActivity = ({ user_id, user_name, action, table_name, row_id, old_data, new_data }) => {
    const sql = `
        INSERT INTO activity_logs (user_id, user_name, action, table_name, row_id, old_data, new_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        user_id || null,
        user_name || 'System',
        action,
        table_name,
        row_id,
        old_data ? JSON.stringify(old_data) : null,
        new_data ? JSON.stringify(new_data) : null
    ];

    db.query(sql, values, (err) => {
        if (err) {
            console.error("❌ Error logging activity:", err.message);
        }
    });
};
