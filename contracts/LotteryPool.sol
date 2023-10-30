// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LotteryPool
 * @author Self
 * @notice A smart contract for playing ether game where randomly chosen player get all the ether deposited the the contract.
 * @notice Each player must send 0.1 eth, out of which 0.01 is sent to the deployer/owner of the contract.
 * @notice Only 5 person can ether the game. As soon as 5th person ether the game the  total contract balance is sent to the randomly chosen player.
 * @notice After each game round if the  winner of the last round plays again, they has to send 0.1 + (number of times won * 0.01). 
 * @notice Deployer/owner can not play the game.

 */

contract LotteryPool {

 
        mapping(address => bool) havePlayedIt;
        mapping(address => bool) public playerRegistered;
        mapping(address => uint) playerDeposit;
        mapping(address => uint) public tgamesOwn;

        address public lastWinner;
        address payable public deployer;

        uint public currentPoolBal;
        uint private deployerEarnings;

        address[]public  players;

        
        constructor() {
            deployer = payable(msg.sender);
        }
    
    // For participants to enter the pool
    function enter() public payable {
        require(msg.sender != deployer, "owner not allowed");
        require(!playerRegistered[msg.sender], "already registered");
        require(players.length <= 5, "lotter filled");
       ( uint _tAmount, uint _ownerFee )= entryFee(msg.sender);

        require(msg.value == _tAmount, "invalid amount");

        (bool sentOkay, ) = deployer.call{value: _ownerFee}("");

        require(sentOkay, "owner fee sent failed");

        deployerEarnings += _ownerFee;


        playerDeposit[msg.sender] = (_tAmount - _ownerFee);
        playerRegistered[msg.sender] = true;
        players.push(msg.sender);
        havePlayedIt[msg.sender] = true;
        currentPoolBal +=( _tAmount - _ownerFee);

        if(players.length == 5) {

            uint _idx = uint256(keccak256(abi.encodePacked(
            tx.origin,
            blockhash(block.number - 1),
            block.timestamp
      
             ))) % 5 ;
            lastWinner = players[_idx] ;
            tgamesOwn[lastWinner]++;

            (bool ok,)  = msg.sender.call{value: currentPoolBal}("");

            require(ok, "send failed");

            currentPoolBal = 0;


        for(uint i; i<5;i++){


            address p = players[5 - 1 - i];
            delete havePlayedIt[p];

            delete playerRegistered[p];

            players.pop();
        }
        }

    }


    function entryFee(address _pl) public view returns(uint _tAmount, uint _ownerFee) {
        if(tgamesOwn[_pl] == 0) {
         _tAmount =  (0.1 * 1e18);
         _ownerFee =  (_tAmount * 10 / 100);

        } else {

         _tAmount =  (0.1 * 1e18) + (tgamesOwn[_pl] * (0.01 * 1e18));
         _ownerFee =  (_tAmount * 10 / 100) / 1e18;
        }
        
    }

    // For participants to withdraw from the pool
    function withdraw() public {

        (bool sent, ) = msg.sender.call{value: playerDeposit[msg.sender]}("");

        require(sent, "withdraw failed");


    }


    // To view participants in current pool
    function viewParticipants() public view returns (address[] memory, uint) {
        if(players.length == 0) return( players, 0);

        uint _count;

        for(uint i; i<players.length; i++) {
            if(havePlayedIt[players[i]] == true) {
                _count++;
            }
        }

        return(
            players,
            _count
        );
    }

    // To view winner of last lottery
    function viewPreviousWinner() public view returns (address) {

        return lastWinner;
    }

        // To view the amount earned by Gavin
    function viewEarnings() public view returns (uint256) {
        require(msg.sender == deployer, "only deployer");
        return deployerEarnings;
    }

    // To view the amount in the pool
    function viewPoolBalance() public view returns (uint256) {
        return currentPoolBal;
    }
}
