// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @notice Minimal ERC20 with owner-gated mint and voluntary burn.
 * @dev Deployer becomes the initial owner; transferOwnership(...) to a multisig in production.
 */
contract MyToken is ERC20, ERC20Burnable, Ownable {
    /**
     * @param name_   Token name (e.g., "MyToken")
     * @param symbol_ Token symbol (e.g., "MYT")
     * @param initialSupply Amount in smallest units (e.g., 1e18 per token when decimals=18)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice Mint new tokens to `to`.
     * @dev Restricted to owner.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
