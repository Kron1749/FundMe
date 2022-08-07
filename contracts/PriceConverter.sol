// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function GetLastestPrice() internal view returns (uint256) {
        AggregatorV3Interface Price = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
        (, int256 price, , , ) = Price.latestRoundData();
        return uint256(price * 10000000000);
    }

    function GetValueInDOllar(uint ethAmount) internal view returns (uint) {
        uint valuePrice = GetLastestPrice();
        uint amountInDollars = (valuePrice * ethAmount) / 1000000000000000000;
        return amountInDollars;
    }
}
