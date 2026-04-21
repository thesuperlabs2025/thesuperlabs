import { automateOrderToMaster } from './automation.js';

const orderId = 7; // Recently approved order
console.log(`Testing automation for Order ID: ${orderId}`);
automateOrderToMaster(orderId).then(() => {
    console.log("Test execution finished.");
    process.exit(0);
}).catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
