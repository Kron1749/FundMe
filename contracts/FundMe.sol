// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughEth();

contract FundMe {
    using PriceConverter for uint256;
    mapping(address => uint256) private s_addressesFunded; //s_ means working with storage
    address[] private s_funders;
    address private immutable i_owner; //i_ means immutable
    uint256 public constant MINIMUMUSD = 100 * 10**18;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        if (msg.value.GetValueInDOllar(s_priceFeed) <= MINIMUMUSD) revert FundMe__NotEnoughEth();
        s_funders.push(msg.sender);
        s_addressesFunded[msg.sender] += msg.value;
    }

    function withdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 i = 0; i < funders.length; i++) {
            s_addressesFunded[funders[i]] = 0;
        }
        payable(msg.sender).transfer(address(this).balance);
        s_funders = new address[](0);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getAddressToAmoundFunded(address funder) public view returns (uint256) {
        return s_addressesFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
