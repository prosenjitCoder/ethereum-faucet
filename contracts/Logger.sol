// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// it's a way for designer to say that "any child of the abstract contract has to implement specified methods"

abstract contract Logger {
    uint256 public num;

    constructor() {
        num = 1000;
    }

    function emitLog() external pure virtual returns (bytes32);

    function test() external pure returns (uint256) {
        return 100;
    }
}
