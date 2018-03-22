//iot side
// don't forget to install the following modules

var keythereum = require("keythereum");
const secp256k1 = require('secp256k1')
const createKeccakHash = require('keccak')
var net = require('net');
const express = require('express');
const bodyParser = require('body-parser');
const LoginContract = require('./login_contract.js');
const jwt = require('jsonwebtoken');
const cuid = require('cuid');
const cors = require('cors');
var Web3 = require('web3');
var web3 = new Web3();

var HOST = '<IOT ip address>';
var event_happened = false;
var PORT = 9090;
var message;
var sign;
var cnt =0;
var token ; 
var address; 
var publickey = new Buffer(1)

//////////////////wait for event
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
const loginContract = LoginContract.at(process.env.LOGIN_CONTRACT_ADDRESS || '<smart contract eth address>');

const loginAttempt = loginContract.LoginAttempt();

loginAttempt.watch((error, event) => {
    if(error) {
        console.log(error);
        return;
    }


    event_happened = true;
    address = event.args.sender.toLowerCase();
     token = event.args.token;
console.log("\x1b[42m","[+] Authentication Event Arrived")
console.log("\x1b[0m","\n");
    console.log("Sender Address: "+address);
    console.log("Authentication Token: "+token);
    

});

// listen to input
net.createServer(function(sock) {
    

    console.log('CONNECTED Client: ' + sock.remoteAddress +':'+ sock.remotePort);
	
    

    sock.on('data', function(data) {
     
	if (cnt == 0){message=data.toString();
	cnt++;
	}
	if (cnt == 1){publickey=data;
	cnt++;
	}
	if (cnt==2){ sign=data.toString();
	cnt++;
	}

	var resM = message.split(",")
	if(cnt===3 && resM[0]===token && resM[1]==sock.remoteAddress.toString()){
		createKeccakHash('keccak256').digest().toString('hex');
		var add = createKeccakHash('keccak256').update(publickey).digest('hex');
		if (address.toString().trim() === address) { 
			console.log("\x1b[42m","[+] User Validated .. Access Granted");
			console.log("\x1b[0m","\n");
			cnt=0;
			sock.write('All Good');
			}
	}
	else {sock.write('!');}

        
    });
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT, HOST);

console.log('Device listening on ' + HOST +':'+ PORT);

