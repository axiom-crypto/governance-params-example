// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { AxiomTest, AxiomVm } from "@axiom-crypto/v2-periphery/test/AxiomTest.sol";
import {Script, console2} from "forge-std/Script.sol";
import { GovernanceToken } from '../src/GovernanceToken.sol';
import { GovernanceNFT } from '../src/GovernanceNFT.sol';

contract GovernanceScript is Script {
    address public constant AXIOM_V2_QUERY_MOCK_SEPOLIA_ADDR = 0x83c8c0B395850bA55c830451Cfaca4F2A667a983;
    bytes32 querySchema;

    function setUp() public {
        string memory artifact = vm.readFile("./app/axiom/data/compiled.json");
        querySchema = bytes32(vm.parseJson(artifact, ".querySchema"));
    }

    function run() public {
        vm.startBroadcast();

        // Deploy NFT
        GovernanceNFT nft = new GovernanceNFT();

        // Mint NFT
        nft.mint();

        // Deploy Gov token
        new GovernanceToken(
            address(nft),
            AXIOM_V2_QUERY_MOCK_SEPOLIA_ADDR,
            11155111,
            querySchema,
            100, // 10.0% taxRate
            100  // 10.0% rewardRate
        );

        vm.stopBroadcast();
    }
}
