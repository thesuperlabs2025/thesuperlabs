import db from "../db.js";

/**
 * Middleware to check if the target year is locked.
 * A year is locked if a year with a later start date exists in the system.
 */
export const checkYearLock = async (req, res, next) => {
    const path = req.originalUrl || req.url;

    // 1️⃣ Always skip for Auth and Accounting Years lookup
    if (path.includes('/auth/') || path.includes('/accounting-years')) {
        return next();
    }

    // 2️⃣ Only intercept mutations for other routes
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        // Use optional chaining for req.body to prevent crashes if body parser hasn't run or failed
        const yearId = req.headers['x-year-id'] || req.body?.year_id;

        // Skip if no yearId provided or if it's explicitly set to not check (optional)
        if (!yearId || yearId === 'null' || yearId === 'undefined') {
            return next();
        }

        try {
            // Selection logic: A year is locked if there exists any year with a start_date 
            // greater than the target year's end_date.
            const lockQuery = `
                SELECT COUNT(*) as lockCount 
                FROM accounting_years 
                WHERE start_date > (
                    SELECT end_date FROM accounting_years WHERE year_id = ?
                )
            `;

            const [rows] = await db.promise().query(lockQuery, [yearId]);

            if (rows[0].lockCount > 0) {
                return res.status(423).json({
                    error: "Year Locked",
                    message: "This accounting year is locked because a newer year exists. You cannot add, edit, or delete records in a locked year."
                });
            }
        } catch (err) {
            console.error("Lock Check Error:", err);
            // On error, we fail safe (allow next) or block? Let's allow next but log.
        }
    }
    next();
};
