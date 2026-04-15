const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";
  const VWB_SCHEMA_UID = process.env.EAS_TIER2_VWB_SCHEMA_UID;
  const OFFICIAL_ATTESTER = process.env.ATTESTER_ADDRESS;

  if (!VWB_SCHEMA_UID || !OFFICIAL_ATTESTER) {
    throw new Error("Missing EAS_TIER2_VWB_SCHEMA_UID or ATTESTER_ADDRESS in .env");
  }

  console.log("Deploying VWBToken to network:", hre.network.name);
  console.log("EAS Address:", EAS_ADDRESS);
  console.log("Schema UID:", VWB_SCHEMA_UID);
  console.log("Attester Address:", OFFICIAL_ATTESTER);

  const VWBToken = await hre.ethers.getContractFactory("VWBToken");
  const vwbToken = await VWBToken.deploy(EAS_ADDRESS, VWB_SCHEMA_UID, OFFICIAL_ATTESTER);

  await vwbToken.waitForDeployment();

  const deployedAddress = await vwbToken.getAddress();
  console.log("--- DEPLOYMENT SUCCESSFUL ---");
  console.log("VWBToken deployed to:", deployedAddress);
  console.log("-----------------------------");
  console.log("Action: Copy this address to VWB_CONTRACT_ADDRESS in your .env file.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
