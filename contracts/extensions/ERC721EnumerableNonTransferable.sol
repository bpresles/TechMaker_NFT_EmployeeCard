// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// Import of ERC721 Enumerable standard
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// Import of Ownable standard
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ERC721EnumerableNonTransferable is ERC721Enumerable, Ownable {

  /**
   * Ensure transfer is only accepted if initiated for contract creator.
   */
  function _transfer(
      address from,
      address to,
      uint256 tokenId
  ) internal override onlyOwner {
    super._transfer(from, to, tokenId);
  }
  
  /**
   * Ensure that approvals are only allowed for contract owner.
   */
  function approve(address to, uint256 tokenId) public virtual override(ERC721, IERC721) {
      _checkOwner();
      _approve(to, tokenId);
  }

  /**
   * Ensure that burn is only accepted for contract owner. 
   */
    function burn(uint256 tokenId) public virtual {
        _checkOwner();
        _burn(tokenId);
    }
}