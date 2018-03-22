pragma solidity ^0.4.2;

contract Login2 {
  
    event LoginAttempt(address sender, bytes32 token);
    address owner;
    bytes32 public hash;
    string token_raw;
   bytes32 random_number;

    
    function Login2(){
        owner = msg.sender;
        
    }
    
   function rand(uint min, uint max) onlyOwner returns (bytes32){ // min and max are not needed now, some future work idea
        uint256 lastBlockNumber = block.number - 1;
        bytes32 hashVal = bytes32(block.blockhash(lastBlockNumber));
        return bytes32(hashVal);
}
    
     function login_admin() onlyOwner { 
        random_number = rand(1,100);
        hash = keccak256(msg.sender,now,random_number);
        LoginAttempt(msg.sender, hash);
    }


    
    modifier onlyOwner {
       require(msg.sender == owner);
        _;
    }
}


