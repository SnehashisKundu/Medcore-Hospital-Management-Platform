"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSepoliaConnection = testSepoliaConnection;
exports.anchorPaymentHash = anchorPaymentHash;
const ethers_1 = require("ethers");
const rpcUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
if (!rpcUrl) {
    throw new Error("SEPOLIA_RPC_URL is not configured");
}
if (!privateKey) {
    throw new Error("SEPOLIA_PRIVATE_KEY is not configured");
}
const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl, 11155111);
const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
async function testSepoliaConnection() {
    const network = await provider.getNetwork();
    const address = await wallet.getAddress();
    const balance = await provider.getBalance(address);
    console.log("Network Chain ID:", network.chainId.toString());
    console.log("Wallet:", address);
    console.log("Balance:", ethers_1.ethers.formatEther(balance), "SepoliaETH");
}
async function anchorPaymentHash(blockchainHash) {
    const walletAddress = await wallet.getAddress();
    /*
     * We send 0 ETH to our own wallet.
     * The payment hash is stored inside transaction calldata.
     */
    const data = ethers_1.ethers.hexlify(ethers_1.ethers.toUtf8Bytes(`hospital-payment:${blockchainHash}`));
    const tx = await wallet.sendTransaction({
        to: walletAddress,
        value: 0n,
        data,
    });
    console.log("Blockchain transaction submitted:", tx.hash);
    const receipt = await tx.wait();
    if (!receipt) {
        throw new Error("Blockchain transaction receipt not found");
    }
    console.log("Blockchain transaction confirmed:", receipt.hash);
    return receipt.hash;
}
