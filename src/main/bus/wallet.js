const bitcoinjs = require('bitcoinjs-lib');
const bip32 = require('bip32');
const fs = require('fs');
const path = require('path');
const AES = require('./aes');
const bufferhelp = require('./bufferhelp');

var default_fp = path.join(__dirname, '../../../data/');
var fp = path.join(__dirname, '../../../data/account/');

function Wallet(password, filename) {
    this.password = password;
    this.filename = filename == undefined ? 'addr1.cfg' : filename;
    this.create = create;
    this.save = save;
    this.sign = sign;
    this.genAddr = genAddr;
    this.sign = sign;
    this.verify = verify;
    this.getWallet = getWallet;
}

function create(str) {
    if (str.length < 16 || str.length > 32)
        throw new Error('length must be region in 16-32');
    BIP32 = bip32.fromSeed(Buffer.from(str));
    pvk = BIP32.privateKey;
    wif = BIP32.toWIF();
    encrypt = AES.Encrypt(wif, this.password);
    saveToFile(encrypt, this.filename);
}

function save(prvKeyStr) {//import prvkey to local file
    if (prvKeyStr.length != 64)
        throw Error('length must be 64');
    BIP32 = bip32.fromPrivateKey(bufferhelp.hexToBuffer(prvKeyStr), new Buffer(32));
    wif = BIP32.toWIF();
    encrypt = AES.Encrypt(wif, this.password);
    saveToFile(encrypt, this.filename);
}

function sign() {

}

function verify() {

}

function genAddr() {

}

function getWallet() {

}

function random(number) {

}

function readFromFile(password, filename) {//read file

}


function saveToFile(encrypt, filename) {//save file format *.cfg
    var data = {
        'encrypted': true,
        "type": "default",
        "vcn": 0,
        "coin_type": "00",
        "testnet": false,
        "prvkey": encrypt,
        "pubkey": null
    }
    mkdirs(fp, function () {
        data = JSON.stringify(data);
        fs.writeFile(fp + filename, data, (err) => {
            if (err) {
                throw Error('write file err');
            }
        })
        fs.writeFile(default_fp + 'default.cfg', data, (err) => {
            if (err) {
                throw Error('write file err');
            }
        })
    })
}

function mkdirs(dirname, callback) {//create dirs
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}

module.exports = Wallet;