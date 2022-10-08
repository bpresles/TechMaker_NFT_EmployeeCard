// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./EmployeeCard.sol";

contract EmployeeCardFactory is EmployeeCard {
    constructor() EmployeeCard("Younup Employee Card", "YNPC") 
    {}
}