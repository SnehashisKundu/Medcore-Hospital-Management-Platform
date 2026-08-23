import "dotenv/config";

import {
  anchorPaymentHash,
} from "./blockchain.service";

async function main() {
  const hash =
    "YOUR_EXISTING_BLOCKCHAIN_HASH";

  const txHash =
    await anchorPaymentHash(hash);

  console.log("TX HASH:", txHash);
}

main().catch((error) => {
  console.error(
    "Blockchain transaction failed:",
    error
  );

  process.exit(1);
});