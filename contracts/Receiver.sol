// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../contracts/interface/ERC721_Receiver.interface.sol";

contract Receiver is IERC721Receiver {

    function onERC721Received(
        address operator,
        address from,
        uint tokenId,
        bytes calldata data
    ) external override returns (bytes4){
        return this.onERC721Received.selector;
    }
}