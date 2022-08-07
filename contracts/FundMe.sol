// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;
    mapping(address => uint) public addressesFunded;
    address[] public funders;
    address public owner;
    uint256 minimumUSD = 50 * 10**18;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function fund() public payable {
        require(
            msg.value.GetValueInDOllar() >= minimumUSD,
            "Not enough amount in ETH"
        );
        funders.push(msg.sender);
        addressesFunded[msg.sender] += msg.value;
    }

    function withdraw() public payable onlyOwner {
        for (uint i = 0; i < funders.length; i++) {
            addressesFunded[funders[i]] = 0;
        }
        payable(msg.sender).transfer(address(this).balance);
        funders = new address[](0);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }
}