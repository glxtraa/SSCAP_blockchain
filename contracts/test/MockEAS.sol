// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockEAS {
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

    mapping(bytes32 => Attestation) public attestations;

    function setAttestation(bytes32 uid, Attestation memory attestation) external {
        attestations[uid] = attestation;
    }

    function getAttestation(bytes32 uid) external view returns (Attestation memory) {
        return attestations[uid];
    }
}
