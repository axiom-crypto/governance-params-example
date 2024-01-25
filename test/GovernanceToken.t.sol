// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { AxiomTest, AxiomVm } from "@axiom-crypto/v2-periphery/test/AxiomTest.sol";
import { IAxiomV2Query } from "@axiom-crypto/v2-periphery/interfaces/query/IAxiomV2Query.sol";

import { GovernanceToken } from "../src/GovernanceToken.sol";
import { GovernanceNFT } from "../src/GovernanceNFT.sol";

contract GovernanceTokenTest is AxiomTest {
    GovernanceToken public governanceToken;
    GovernanceNFT public governanceNft;

    function setUp() public {
        _createSelectForkAndSetupAxiom("sepolia", 5_103_100);

        governanceNft = new GovernanceNFT();
        governanceNft.mint();

        inputPath = "app/axiom/data/inputs.json";
        querySchema = axiomVm.compile("app/axiom/governance.circuit.ts", inputPath);
        governanceToken = new GovernanceToken(
            address(governanceNft),
            axiomV2QueryAddress,
            uint64(block.chainid),
            querySchema,
            100, // 10.0% taxRate
            100  // 10.0% rewardRate
        );
    }

    function test_axiomSendQuery() public {
        AxiomVm.AxiomSendQueryArgs memory args =
            axiomVm.sendQueryArgs(inputPath, address(governanceToken), callbackExtraData, feeData);

        axiomV2Query.sendQuery{ value: args.value }(
            args.sourceChainId,
            args.dataQueryHash,
            args.computeQuery,
            args.callback,
            args.feeData,
            args.userSalt,
            args.refundee,
            args.dataQuery
        );
    }

    function test_axiomCallback() public {
        AxiomVm.AxiomFulfillCallbackArgs memory args =
            axiomVm.fulfillCallbackArgs(inputPath, address(governanceToken), callbackExtraData, feeData, msg.sender);
        axiomVm.prankCallback(args);
    }
}
