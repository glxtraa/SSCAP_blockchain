// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Simple interface for EAS
interface IEAS {
    struct Attestation {
        bytes32 uid;
        bytes32 schema;
        uint64 time;
        uint64 expirationTime;
        uint64 revocationTime;
        bytes32 refUID;
        address recipient;
        address attester;
        bool revocable;
        bytes data;
    }
    function getAttestation(bytes32 uid) external view returns (Attestation memory);
}

/**
 * @title VWBToken
 * @dev ERC20 token that mints based on Volumetric Water Benefit (VWB) attestations.
 */
contract VWBToken is ERC20, Ownable {
    IEAS public immutable eas;
    bytes32 public vwbSchemaUID;
    address public officialAttester;

    // Track used attestations to prevent double-minting
    mapping(bytes32 => bool) public usedAttestations;

    event VWBMinted(address indexed recipient, uint256 amount, bytes32 indexed attestationUID);

    constructor(
        address _easAddress,
        bytes32 _vwbSchemaUID,
        address _officialAttester
    ) ERC20("Volumetric Water Benefit", "VWB") Ownable(msg.sender) {
        eas = IEAS(_easAddress);
        vwbSchemaUID = _vwbSchemaUID;
        officialAttester = _officialAttester;
    }

    /**
     * @dev Mints VWB tokens using an EAS attestation as proof.
     * @param attestationUID The UID of the Tier 2 EAS attestation.
     */
    function mintFromAttestation(bytes32 attestationUID) external {
        require(!usedAttestations[attestationUID], "Attestation already used");
        
        IEAS.Attestation memory attestation = eas.getAttestation(attestationUID);
        
        // Validation
        require(attestation.schema == vwbSchemaUID, "Invalid schema");
        require(attestation.attester == officialAttester, "Invalid attester");
        require(attestation.revocationTime == 0, "Attestation revoked");

        // Decode data
        // Schema: string basin, string quarter, uint256 totalLiters, string computationProofsUrl
        // We only care about totalLiters for minting.
        // decoding: (string, string, uint256, string)
        (,, uint256 totalLiters, ) = abi.decode(attestation.data, (string, string, uint256, string));

        require(totalLiters > 0, "No liters to mint");

        usedAttestations[attestationUID] = true;
        
        // Minting to the caller or a designated treasury
        _mint(msg.sender, totalLiters);

        emit VWBMinted(msg.sender, totalLiters, attestationUID);
    }

    // Owner functions to update configuration if needed
    function updateConfig(bytes32 _newSchema, address _newAttester) external onlyOwner {
        vwbSchemaUID = _newSchema;
        officialAttester = _newAttester;
    }
}
