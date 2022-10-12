// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Import of extension for SBT token.
import "./extensions/ERC721EnumerableNonTransferable.sol";
// Import of Strings standard
import "@openzeppelin/contracts/utils/Strings.sol";

contract EmployeeCard is ERC721EnumerableNonTransferable {

  /**
   * On chain card data structure.
   */
  struct CardData {
    string tokenURI;
    uint256 startDate;
  }

  // Map of cards data by tokenId.
  mapping(uint256 => CardData)  private _cards;

  // Event when tokens are sent.
  event tokenReceived(address sender, uint256 amount);
  event callReceived(address sender, uint256 amount, bytes data);

  constructor(string memory name, string memory symbol) ERC721(name, symbol) ERC721EnumerableNonTransferable() {}
    
  /**
   * Gets the URI of the token metadata. Using IPFS URI is highly recommended.
   */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "EmployeeCard: token does not exist");
    return string(_cards[tokenId].tokenURI);
  }

  /**
   * Mint a new employee card SBT token.
   */
  function mint(address recipient, string memory _tokenURI, uint256 _startDate) public onlyOwner returns(uint256) {
    uint256 tokenId = this.totalSupply();
    _safeMint(recipient, tokenId);

    require(_exists(tokenId), "ERC721: invalid token ID");
    _cards[tokenId] = CardData(_tokenURI, _startDate);
    _approve(owner(), tokenId);

    return tokenId;
  }

  /**
   * Calculate total amount of days the employee can expect according to its time in the company.
   */
   function getEmployeeVacationRights(uint256 tokenId) public view returns(uint256) {
    _requireMinted(tokenId);

    uint256 nbOfFullYears = (block.timestamp - _cards[tokenId].startDate) / 31536000;
    uint256 nbAdditionalDays = nbOfFullYears/2;

    return 25 + nbAdditionalDays;
  }

  /**
   * Make the contract destructible (to remove on prod)
   */
  function destruct() public onlyOwner {
    selfdestruct(payable(owner()));
  }

  /**
   * Only the owner should be able to add tokens to this contract.
   */
  receive() external payable onlyOwner {
    emit tokenReceived(msg.sender, msg.value);
  }

  fallback() external payable onlyOwner {
    emit callReceived(msg.sender, msg.value, msg.data);
  }

}