// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Owned.sol";
import "./Logger.sol";
import "./IFaucet.sol";

contract Faucet is Owned, Logger, IFaucet {
    // private -> can be accessible only within the smart contract
    // internal -> can be accessible within smart contract and also derived smart contract
    uint8 public numOfFunders;
    mapping(address => bool) public funders;
    mapping(uint256 => address) public lutFunders;

    modifier limitWithdraw(uint256 withdrawAmount) {
        require(
            withdrawAmount <= 100000000000000000,
            "Cannot withdraw more than 0.1 ether"
        );
        _;
    }

    function emitLog() external pure override returns (bytes32) {
        return "Hello world";
    }

    // this is a special function
    // it's called when you make a tx that doesn't specify function name to call
    // external function are part of the contract interface
    // which mean they can be called via contracts and other txs
    receive() external payable {}

    function addFunds() external payable override {
        address funder = msg.sender;
        if (!funders[funder]) {
            uint8 index = numOfFunders++;
            lutFunders[index] = funder;
            funders[funder] = true;
        }
    }

    function withdraw(uint256 withdrawAmount)
        external
        override
        limitWithdraw(withdrawAmount)
    {
        payable(msg.sender).transfer(withdrawAmount);
    }

    function getAllFunders() external view returns (address[] memory) {
        address[] memory _funders = new address[](numOfFunders);

        for (uint256 i = 0; i < numOfFunders; i++) {
            _funders[i] = lutFunders[i];
        }

        return _funders;
    }

    function getFunderAtIndex(uint8 index) external view returns (address) {
        return lutFunders[index];
    }

    // pure, view - read-only, no gas fee
    // view - it indicates that the function will not alter the storage state in any way
    // pure - it is even more strict, indicating that it won't even read the storage state

    // transactions (can generate state changes) and require gas fee
    // read-only call, no gas fee
    // to talk to the node on the network you can make JSON-RPC http calls
}

// const instance = await Faucet.deployed()
// instance.addFunds({from:accounts[0], value:"2000000000000000000"})
// instance.getFunderAtIndex(0)
// instance.withdraw("100000000000000000", {from: accounts[1]})
