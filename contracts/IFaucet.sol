// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// they can not inherit from other smart contracts, they can only inherit from other interfaces
// they can not declare a constructor, they can not declare state variables
// all declared functions have to be external

interface IFaucet {
    function addFunds() external payable;

    function withdraw(uint256 withdrawAmount) external;
}
