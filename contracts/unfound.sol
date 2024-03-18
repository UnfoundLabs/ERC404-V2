//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ERC404.sol"; // Ensure this path is correct

contract Unfound is Ownable, ERC404 {
    uint256 private constant MAX_TOTAL_SUPPLY_ERC721 = 8;
    uint256 public constant FRACTIONS_PER_TOKEN = 1e18; // Assuming 18 decimal places for the ERC20 part
    using Strings for uint256;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC404(name_, symbol_, decimals_) Ownable(msg.sender) {
        // Do not mint the ERC721s to the initial owner, as it's a waste of gas.
        _setERC721TransferExempt(msg.sender, true);
        
        // Mint ERC20 tokens to the initial owner based on the ERC-721 max supply
        _mintERC20(msg.sender, MAX_TOTAL_SUPPLY_ERC721 * FRACTIONS_PER_TOKEN);
    }

    // Override the tokenURI function to ensure it uses the simplified ID system
    function tokenURI(uint256 $id) public pure override returns (string memory) {
        // Construct the URI based on the simplified ID
        uint256 tokenId = $id - (1 << 255);
        string memory baseURI = "https://raw.githubusercontent.com/UnfoundLabs/assets/main/metadata/";
        return string.concat(baseURI, tokenId.toString(), ".json");
    }

    function setERC721TransferExempt(address account_, bool value_) external onlyOwner {
        _setERC721TransferExempt(account_, value_);
    }
}