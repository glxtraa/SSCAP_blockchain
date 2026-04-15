const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VWBToken", function () {
  let vwbToken;
  let owner;
  let attester;
  let recipient;
  let mockEAS;

  const SCHEMA_UID = "0xab88b0e3d38416e68dcc636a0f8891da486e3861b064a8b5659fdd7d616ec7f7";

  beforeEach(async function () {
    [owner, attester, recipient] = await ethers.getSigners();

    // 1. Deploy Mock EAS
    const MockEAS = await ethers.getContractFactory("MockEAS");
    mockEAS = await MockEAS.deploy();

    // 2. Deploy VWBToken
    const VWBToken = await ethers.getContractFactory("VWBToken");
    vwbToken = await VWBToken.deploy(await mockEAS.getAddress(), SCHEMA_UID, attester.address);
  });

  it("Should mint tokens from a valid attestation", async function () {
    const totalLiters = 1000;
    const attestationUID = ethers.encodeBytes32String("test-attestation");

    // Encode data according to schema: string basin, string quarter, uint256 totalLiters, string computationProofsUrl
    const abiCoder = new ethers.AbiCoder();
    const encodedData = abiCoder.encode(
      ["string", "string", "uint256", "string"],
      ["Valle de México", "2026-Q1", totalLiters, "https://arweave.net/proof"]
    );

    // Mock the EAS response
    await mockEAS.setAttestation(attestationUID, {
      uid: attestationUID,
      schema: SCHEMA_UID,
      time: 0,
      expirationTime: 0,
      revocationTime: 0,
      refUID: ethers.ZeroHash,
      recipient: ethers.ZeroAddress,
      attester: attester.address,
      revocable: false,
      data: encodedData
    });

    // Mint!
    await vwbToken.connect(recipient).mintFromAttestation(attestationUID);

    expect(await vwbToken.balanceOf(recipient.address)).to.equal(totalLiters);
    expect(await vwbToken.usedAttestations(attestationUID)).to.be.true;
  });
});
