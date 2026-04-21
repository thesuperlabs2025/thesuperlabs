import axios from 'axios';

const API = "http://localhost:8081";

async function check() {
    try {
        console.log("Checking /fabric-to-pcs-outward/next-no/order...");
        const res0 = await axios.get(`${API}/fabric-to-pcs-outward/next-no/order`);
        console.log("Next No:", res0.data);

        console.log("Checking /yarn-dyeing-outward/orders...");
        const res1 = await axios.get(`${API}/yarn-dyeing-outward/orders`);
        console.log("Orders:", res1.data);

        console.log("Checking /life-cycles...");
        const res2 = await axios.get(`${API}/life-cycles`);
        console.log("Life Cycles:", res2.data);

        process.exit();
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) console.error("Response data:", err.response.data);
        process.exit(1);
    }
}

check();
