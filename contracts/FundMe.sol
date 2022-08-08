// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;
    mapping(address => uint256) public addressesFunded;
    address[] public funders;
    address public owner;
    uint256 public constant MINIMUMUSD = 100 * 10**18;
    AggregatorV3Interface public s_priceFeed;

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert FundMe__NotOwner();
        _;
    }

    function fund() public payable {
        require(msg.value.GetValueInDOllar(s_priceFeed) >= MINIMUMUSD, "Not enough amount in ETH");
        funders.push(msg.sender);
        addressesFunded[msg.sender] += msg.value;
    }

    function withdraw() public payable onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            addressesFunded[funders[i]] = 0;
        }
        payable(msg.sender).transfer(address(this).balance);
        funders = new address[](0);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getOwner() public view returns (address) {
        return owner;
    }
}
