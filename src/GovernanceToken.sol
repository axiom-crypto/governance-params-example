// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { AxiomV2Client } from "@axiom-crypto/v2-periphery/client/AxiomV2Client.sol";
import "@openzeppelin-contracts/token/ERC20/ERC20.sol";
import "./GovernanceNFT.sol";

contract GovernanceToken is ERC20, AxiomV2Client {
    /// @dev The unique identifier of the circuit accepted by this contract.
    bytes32 immutable QUERY_SCHEMA;

    /// @dev The chain ID of the chain whose data the callback is expected to be called from.
    uint64 immutable SOURCE_CHAIN_ID;

    event ParametersUpdated(
        address indexed callerAddr,
        uint256 indexed tokenId,
        uint256 indexed queryId,
        uint256 newTaxRate,
        uint256 newRewardRate,
        uint256 totalVotes
    );

    uint256 public taxRate;
    uint256 public rewardRate;
    uint256 public totalVotes;
    mapping(bytes32 => bool) public didVote;
    GovernanceNFT public governanceNft;

    constructor(
        address _nftContract,
        address _axiomV2QueryAddress,
        uint64 _callbackSourceChainId,
        bytes32 _axiomCallbackQuerySchema,
        uint256 _defaultTaxRate,
        uint256 _defaultRewardRate
    )
        ERC20("Useless Governance Token", "UGT")
        AxiomV2Client(_axiomV2QueryAddress)
    {
        SOURCE_CHAIN_ID = _callbackSourceChainId;
        QUERY_SCHEMA = _axiomCallbackQuerySchema;
        taxRate = _defaultTaxRate;
        rewardRate = _defaultRewardRate;
        governanceNft = GovernanceNFT(_nftContract);
    }

    function didUserVote(address user, uint256 tokenId) external view returns (bool) {
        bytes32 holderTokenIdHash = keccak256(abi.encodePacked(user, tokenId));
        return didVote[holderTokenIdHash];
    }

    /// @inheritdoc AxiomV2Client
    function _axiomV2Callback(
        uint64, // sourceChainId,
        address caller,
        bytes32, // querySchema,
        uint256 queryId,
        bytes32[] calldata axiomResults,
        bytes calldata // extraData
    ) internal override {
        // Parse results array
        address claimedOwner = address(uint160(uint256(axiomResults[0])));
        uint256 tokenId = uint256(axiomResults[1]);
        uint256 vote = uint256(axiomResults[2]);

        // Get current owner of `tokenId`
        address currentNftOwner = governanceNft.ownerOf(tokenId);

        // Hash the holder and tokenId to get an identifier for holder + tokenId 
        bytes32 holderTokenIdHash = keccak256(abi.encodePacked(claimedOwner, tokenId));

        // Validation checks
        require(!didVote[holderTokenIdHash], "GovernanceToken: claimedOwner already voted with this tokenId");
        require(claimedOwner == caller, "GovernanceToken: claimedOwner must be caller");
        require(claimedOwner == currentNftOwner, "GovernanceToken: claimedOwner must be current owner");

        // Update state based on user's vote
        if (vote == 1) {
            // Increase the tax and reward rates by 0.1%;
            taxRate += 1;
            rewardRate += 1;
            totalVotes += 1;
        } else if (vote == 2) {
            // Decrease the tax and reward rates by 0.1%;
            taxRate -= 1;
            rewardRate -= 1;
            totalVotes += 1;
        } else {
            revert("GovernanceToken: invalid vote");
        }

        // Mark user as having voted
        didVote[holderTokenIdHash] = true;

        // Emit events
        emit ParametersUpdated(caller, tokenId, queryId, taxRate, rewardRate, totalVotes);
    }

    /// @inheritdoc AxiomV2Client
    function _validateAxiomV2Call(
        AxiomCallbackType, // callbackType,
        uint64 sourceChainId,
        address, // caller,
        bytes32 querySchema,
        uint256, // queryId,
        bytes calldata // extraData
    ) internal view override {
        require(uint256(sourceChainId) == block.chainid, "AxiomV2: sourceChainId must be current chainId");
        require(querySchema == QUERY_SCHEMA, "AxiomV2: query schema mismatch");
    }
}