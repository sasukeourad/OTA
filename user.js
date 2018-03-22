//user side 
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


var token ; 
var ip = "<user ip address>";
var time = 20;
var HOST = '<IOT ip address>';
var PORT = 9090;
var event_happened = false;




// get key pair
var password = "";

var datadir = "<keystore path>";

var keyObject = keythereum.importFromFile("<user keystore file>", datadir);

var privateKey = keythereum.recover(password, keyObject);

var publickey = secp256k1.publicKeyCreate(privateKey, false).slice(1)

createKeccakHash('keccak256').digest().toString('hex')
var add = createKeccakHash('keccak256').update(publickey).digest('hex')
var address = add.substring(24, 64); 
if (address.toString().trim() === '<user eth address>') {
console.log("\x1b[42m","[+] Key pair and Ethereum Address verified")
console.log("\x1b[0m","\n");
}

//////////////////wait for event

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
const loginContract = LoginContract.at(process.env.LOGIN_CONTRACT_ADDRESS || '<smart contract eth address>');

const loginAttempt = loginContract.LoginAttempt();


loginAttempt.watch((error, event) => {
    if(error) {
        console.log(error);
        return;
    }

   // console.log(event);
    event_happened = true;
    const sender = event.args.sender.toLowerCase();
     token = event.args.token;
console.log("\x1b[42m","[+] Authentication Event Arrived")
console.log("\x1b[0m","\n");
    console.log("Sender Address: "+sender);
    console.log("Authentication Token: "+token);

if (event_happened == true)
{
message= token+","+ip+","+time+","+publickey
console.log("Authentication Package: "+message);
web3.personal.unlockAccount('<user eth address>', '<user password>', 20)

var sign = web3.eth.sign('<user eth address>', web3.sha3(message));
console.log("Signature: "+sign);

//connection to iot



var client = new net.Socket();
client.connect(PORT, HOST, function() {


    console.log('CONNECTED TO IOT Device: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    client.write(message);
    client.write(publickey);
    
    

});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    

	client.write(sign);
    console.log('Status: ' + data);
    // Close the client socket completely
    client.destroy();
    
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});


}    event_happened = true;
});

