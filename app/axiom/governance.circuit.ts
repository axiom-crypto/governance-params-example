import {
  addToCallback,
  CircuitValue,
  CircuitValue256,
  getReceipt,
  checkEqual,
  isEqual,
  or,
  log
} from '@axiom-crypto/client';

export interface CircuitInputs {
  nftContract: CircuitValue,
  mintBlock: CircuitValue,
  mintTxNo: CircuitValue,
  vote: CircuitValue,
}

export const circuit = async (inputs: CircuitInputs) => {
  // Autonomous Community Governance
  // Example NFT mint tx here:
  // https://sepolia.etherscan.io/tx/0x4ea1cbee2408259092a5d365ea4d287a1e04edb1a139c626bfc700354c10c49c#eventlog
  //
  // Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokenId)
  const transferEventSchema =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  const transferLog = (await getReceipt(inputs.mintBlock, inputs.mintTxNo)).log(0);

  // 1. check that the address that emitted the transfer is the NFT contract
  const contractAddr: CircuitValue256 = await transferLog.address();
  checkEqual(contractAddr.toCircuitValue(), inputs.nftContract);

  // 2. check that the tx is a mint tx (from = address(0))
  const fromAddr: CircuitValue256 = await transferLog.topic(1, transferEventSchema);
  checkEqual(fromAddr.toCircuitValue(), 0);

  // 3. get the minter's address and the token id of the NFT
  const toAddr = await transferLog.topic(2, transferEventSchema);
  const tokenId = await transferLog.topic(3, transferEventSchema);

  // 4. check that the user submits a vote of either 1 (yes) or 2 (no)
  const isOne = isEqual(1, inputs.vote);
  const isTwo = isEqual(2, inputs.vote);
  const isVoteValid = or(isOne, isTwo);
  checkEqual(isVoteValid, 1);

  // 5. add [nft holder address, tokenId, vote] to the callback
  // to be passed to the on-chain contract for consumption
  addToCallback(toAddr);
  addToCallback(tokenId);
  addToCallback(inputs.vote);
};
