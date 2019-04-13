const bitcoinjs = require('bitcoinjs-lib');
const ripemd160 = require('ripemd160');
var bs58check = require('bs58check')
const sha512 = require('js-sha512');
const sha256 = require('js-sha256');
const bip32 = require('bip32');
const fs = require('fs');
const path = require('path');
const bs58 = require('bs58')
const AES = require('./aes');
const bufferhelp = require('./bufferhelp');

var default_fp = path.join(__dirname, '../../../data/');
var fp = path.join(__dirname, '../../../data/account/');

function Wallet(password, filename) {//Wallet

    this.password = password == undefined ? '12345678' : password;
    this.filename = filename == undefined ? 'addr1.cfg' : filename;

    this.create = create;
    this.save = save;
    this.sign = sign;
    this.genAddr = genAddr;
    this.sign = sign;
    this.verify = verify;
    this.getBIP32=getBIP32;
    this.getAddrFromWallet = getAddrFromWallet;
}

function create(str) {// create loacl wallet *.cfg file 
    console.log(str);
    if (str.length < 16 || str.length > 32)
        throw new Error('phone+pwd length must be region in 16-32');
    var BIP32 = bip32.fromSeed(Buffer.from(str));
    var wif = BIP32.toWIF();
    var len = (wif.length).toString(16);
    wif = len + wif;
    var encrypt = AES.Encrypt(wif, this.password);
    saveToFile(encrypt, this.filename);//save to file
    var address = genAddr(BIP32);//generate address
    return address;
}

function save(prvKeyStr) {//import prvkey to local *.fgfile
    console.log(prvKeyStr, prvKeyStr.length);
    if (prvKeyStr.length != 64)
        throw Error('length must be 64');
    var BIP32 = bip32.fromPrivateKey(bufferhelp.hexToBuffer(prvKeyStr), new Buffer(32));
    var wif = BIP32.toWIF();
    var len = (wif.length).toString(16);
    wif = len + wif;
    var encrypt = AES.Encrypt(wif, this.password);
    saveToFile(encrypt, this.filename);//save to file
    var address = genAddr(BIP32);//generate address
    return address;
}

function genAddr(BIP32) {// generate address
    var pubbuf = BIP32.publicKey;
    var hashbuf = sha512.array(pubbuf);
    var s1 = new ripemd160().update(Buffer.from(hashbuf.slice(0, 32), 'hex')).digest();
    var s2 = new ripemd160().update(Buffer.from(hashbuf.slice(32, 64), 'hex')).digest();

    //NBC地址
    var version = 0x00;
    var cointype = 0x00;
    var vcn = 0x00;

    var hi = (vcn & 0xffff) / 256;
    var lo = (vcn & 0xffff) % 256;
    var buf0 = bufferhelp.hexToBuffer(sha256(Buffer.concat([s1, s2])));

    var v = Buffer.concat([Buffer.from([version]), Buffer.from([hi, lo]), buf0, Buffer.from([cointype])]);

    var d1buf = bufferhelp.hexToBuffer(sha256(v));
    var checksum = bufferhelp.hexToBuffer(sha256(d1buf)).slice(0, 4);
    var result = Buffer.concat([v, checksum]);
    var addr = bs58.encode(result);
    return addr;
}

function getBIP32() {
    var filename=this.filename;
    var password=this.password;
    console.log('filename:',filename,password);
    if (password == undefined || filename==undefined) throw 'wallet error';
    var data = readFromFile(filename);
    var encrypt_prvkey = data['prvkey'];
    var s = AES.Decrypt(encrypt_prvkey, password);
    var n = bs58check.decode(s.slice(2));
    var prvKeyBuf = n.slice(1, 33);
    var BIP32 = bip32.fromPrivateKey(prvKeyBuf, new Buffer(32));
    return BIP32;
}

function getAddrFromWallet() {
    var filename=this.filename;
    var password=this.password;
    console.log('filename:',filename,password);
    if (password == undefined || filename==undefined) throw 'wallet error';
    var data = readFromFile(filename);
    var encrypt_prvkey = data['prvkey'];
    var s = AES.Decrypt(encrypt_prvkey, password);
    var n = bs58check.decode(s.slice(2));
    var prvKeyBuf = n.slice(1, 33);
    var BIP32 = bip32.fromPrivateKey(prvKeyBuf, new Buffer(32));
    var addr = genAddr(BIP32);
    return addr;
}

function readFromFile(filename) {//read file
    const data = fs.readFileSync(fp + filename + '.cfg', "utf-8");//sync read
    return JSON.parse(data);
}

function sign(BIP32,buf){
    var hash=bitcoinjs.crypto.sha256(buf);
    var s=BIP32.sign(hash);
    return s;
}

function verify() {

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