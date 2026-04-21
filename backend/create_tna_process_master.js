import db from './db.js';

const createProcessMasterTable = `
CREATE TABLE IF NOT EXISTS tna_process_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(255) NOT NULL UNIQUE,
    sequence_no INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const seedProcesses = [
    "Yarn", "Fabric", "Cutting", "Stitching", "Embroidery/Printing", "Finishing", "QC", "Packing", "Dispatch"
];

db.query(createProcessMasterTable, (err) => {
    if (err) {
        console.error("Error creating tna_process_master table:", err);
        process.exit(1);
    }
    console.log("tna_process_master table created or already exists.");

    // Check if empty, then seed
    db.query("SELECT COUNT(*) as count FROM tna_process_master", (err, result) => {
        if (err) {
            console.error("Error checking table count:", err);
            process.exit(1);
        }

        if (result[0].count === 0) {
            const seedQuery = "INSERT INTO tna_process_master (process_name, sequence_no) VALUES ?";
            const seedValues = seedProcesses.map((p, i) => [p, (i + 1) * 10]);

            db.query(seedQuery, [seedValues], (err) => {
                if (err) {
                    console.error("Error seeding processes:", err);
                    process.exit(1);
                }
                console.log("TNA Process Master seeded successfully.");
                process.exit(0);
            });
        } else {
            console.log("TNA Process Master already contains data. Skipping seed.");
            process.exit(0);
        }
    });
});
