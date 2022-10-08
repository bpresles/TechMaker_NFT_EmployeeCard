// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Import of extension for SBT token.
import "./extensions/ERC721EnumerableNonTransferable.sol";
// Import of Strings standard
import "@openzeppelin/contracts/utils/Strings.sol";

contract EmployeeCard is ERC721EnumerableNonTransferable {

  // Map of token URIs by tokenId.
  mapping(uint256 => string)  private _uris;

  // Map of employees start dates by tokenId.
  mapping(uint256 => uint256) private _startDates;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) ERC721EnumerableNonTransferable() {}
    
  /**
   * Gets the URI of the token metadata. Using IPFS URI is highly recommended.
   */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "EmployeeCard: token does not exist");
    return string(_uris[tokenId]);
  }

  /**
   * Mint a new employee card SBT token.
   */
  function mint(address recipient, string memory _tokenURI, uint256 _startDate) public onlyOwner returns(uint256) {
    uint256 tokenId = this.totalSupply();
    _safeMint(recipient, tokenId);

    require(_exists(tokenId), "ERC721: invalid token ID");
    _uris[tokenId] = _tokenURI;
    _startDates[tokenId] = _startDate;
    _approve(owner(), tokenId);

    return tokenId;
  }

  /**
   * Calculate total amount of days the employee can expect according to its time in the company.
   */
   function getEmployeeVacationRights(uint256 tokenId) public view returns(uint256) {
    _requireMinted(tokenId);
    
    uint256 nbOfFullYears = (block.timestamp - _startDates[tokenId]) / 31536000;
    uint256 nbAdditionalDays = nbOfFullYears/2;

    return 25 + nbAdditionalDays;
  }

  /**
   * Make the contract destructible (to remove on prod)
   */
  function destruct() public onlyOwner {
    selfdestruct(payable(owner()));
  }

}