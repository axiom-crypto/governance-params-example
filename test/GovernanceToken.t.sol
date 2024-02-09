// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@axiom-crypto/axiom-std/AxiomTest.sol";

import { GovernanceToken } from "../src/GovernanceToken.sol";
import { GovernanceNFT } from "../src/GovernanceNFT.sol";

contract GovernanceTokenTest is AxiomTest {
    using Axiom for Query;

    struct AxiomInput {
        address nftContract;
        uint64 mintBlock;
        uint64 mintTxNo;
        uint64 vote;
    }

    address public constant MINTER_ADDR = 0xf591C4c1e179A5E16407116882f7F8a524D51d14;
    GovernanceToken public governanceToken;
    GovernanceNFT public governanceNft;

    AxiomInput public defaultInput;
    bytes32 public querySchema;

    function setUp() public {
        _createSelectForkAndSetupAxiom("sepolia", 5_140_364);

        governanceNft = GovernanceNFT(0x271AF2Af5eDeFD176c23bAd4C7139e9C37E3B110);

        defaultInput = AxiomInput({
            nftContract: address(governanceNft),
            mintBlock: 5_140_363,
            mintTxNo: 20,
            vote: 1
        });

        querySchema = axiomVm.readCircuit("app/axiom/governance.circuit.ts", abi.encode(defaultInput));

        governanceToken = new GovernanceToken(
            address(governanceNft),
            axiomV2QueryAddress,
            uint64(block.chainid),
            querySchema,
            100, // 10.0% taxRate
            100  // 10.0% rewardRate
        );
    }

    function test_simple_example() public {
        // create a query into Axiom with default parameters
        Query memory q = query(querySchema, abi.encode(defaultInput), address(governanceToken));

        // send the query to Axiom
        q.send();

        // prank fulfillment of the query, returning the Axiom results 
        bytes32[] memory results = q.prankFulfill(MINTER_ADDR);

        // parse Axiom results and verify length is as expected
        assertEq(results.length, 3);
        address claimedOwner = address(uint160(uint256(results[0])));
        uint256 tokenId = uint256(results[1]);

        // verify the user voted
        require(governanceToken.didUserVote(claimedOwner, tokenId), "User did not vote");
    }
}
