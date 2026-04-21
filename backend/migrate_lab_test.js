import db from "./db.js";

const migrateLabTest = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS lab_tests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lab_test_no VARCHAR(50) UNIQUE,
                test_date DATE,
                buyer_name VARCHAR(255),
                style_no VARCHAR(100),
                order_no VARCHAR(100),
                fabric_type VARCHAR(100),
                fabric_composition VARCHAR(255),
                shade_name VARCHAR(100),
                shade_code VARCHAR(100),
                lot_no VARCHAR(100),
                dyeing_machine_no VARCHAR(100),
                dyeing_type VARCHAR(100),
                sample_type VARCHAR(100),
                
                shade_matching_status VARCHAR(50),
                delta_e_value VARCHAR(50),
                spectrophotometer_reading TEXT,
                light_source_matching VARCHAR(100),
                buyer_approval_date DATE,
                approved_by VARCHAR(255),
                
                washing_fastness_colour_change VARCHAR(10),
                washing_fastness_colour_staining VARCHAR(10),
                rubbing_fastness_dry VARCHAR(10),
                rubbing_fastness_wet VARCHAR(10),
                perspiration_fastness_acid VARCHAR(10),
                perspiration_fastness_alkaline VARCHAR(10),
                light_fastness_grade VARCHAR(10),
                
                gsm_before_dyeing INT,
                gsm_after_dyeing INT,
                shrinkage_length VARCHAR(50),
                shrinkage_width VARCHAR(50),
                spirality VARCHAR(50),
                ph_value VARCHAR(50),
                water_absorvency_time VARCHAR(50),
                bursting_strength VARCHAR(100),
                
                azo_free_test VARCHAR(100),
                formaldehyde VARCHAR(100),
                heavy_metals VARCHAR(100),
                reach_zdhc_compliance VARCHAR(100),
                
                final_decision VARCHAR(50),
                remarks TEXT,
                qc_signature VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.promise().query(createTableQuery);
        console.log("✅ lab_tests table created or already exists");
        process.exit();
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrateLabTest();
