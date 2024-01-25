// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin-contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract GovernanceNFT is ERC721Enumerable {
    constructor() ERC721("GovernanceNFT", "GVN") {}

    function mint() external {
        _mint(msg.sender, this.totalSupply());
    }
}