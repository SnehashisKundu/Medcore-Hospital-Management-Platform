import { ethers } from "ethers";

const rpcUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

if (!rpcUrl) {
  throw new Error("SEPOLIA_RPC_URL is not configured");
}

if (!privateKey) {
  throw new Error("SEPOLIA_PRIVATE_KEY is not configured");
}

const provider = new ethers.JsonRpcProvider(
  rpcUrl,
  11155111
);

const wallet = new ethers.Wallet(
  privateKey,
  provider
);

export async function testSepoliaConnection() {
  const network = await provider.getNetwork();
  const address = await wallet.getAddress();
  const balance = await provider.getBalance(address);

  console.log(
    "Network Chain ID:",
    network.chainId.toString()
  );

  console.log("Wallet:", address);

  console.log(
    "Balance:",
    ethers.formatEther(balance),
    "SepoliaETH"
  );
}

export async function anchorPaymentHash(
  blockchainHash: string
) {
  const walletAddress = await wallet.getAddress();

  /*
   * We send 0 ETH to our own wallet.
   * The payment hash is stored inside transaction calldata.
   */
  const data = ethers.hexlify(
    ethers.toUtf8Bytes(
      `hospital-payment:${blockchainHash}`
    )
  );

  const tx = await wallet.sendTransaction({
    to: walletAddress,
    value: 0n,
    data,
  });

  console.log(
    "Blockchain transaction submitted:",
    tx.hash
  );

  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error(
      "Blockchain transaction receipt not found"
    );
  }

  console.log(
    "Blockchain transaction confirmed:",
    receipt.hash
  );

  return receipt.hash;
}