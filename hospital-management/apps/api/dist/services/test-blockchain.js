"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const blockchain_service_1 = require("./blockchain.service");
async function main() {
    const hash = "YOUR_EXISTING_BLOCKCHAIN_HASH";
    const txHash = await (0, blockchain_service_1.anchorPaymentHash)(hash);
    console.log("TX HASH:", txHash);
}
main().catch((error) => {
    console.error("Blockchain transaction failed:", error);
    process.exit(1);
});
