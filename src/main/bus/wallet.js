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
var default_fullpath = path.join(__dirname, '../../../data/default.cfg');
var default_file = 'default.cfg';

var pubkey;
var address;

function Wallet(password, filename) {//Wallet
    this.password = password;
    this.filename = filename;
    this.init = init;
    this.create = create;
    this.save = save;
    this.sign = sign;
    this.genAddr = genAddr;
    this.sign = sign;
    this.verify = verify;
    this.getBIP32 = getBIP32;
    this.getWalletData = getWalletData;
    this.validate = validate;
    this.getAddrFromWallet = getAddrFromWallet;
    this.getWalletFileList = getWalletFileList;
    this.BIP32 = this.getBIP32();
    this.cfgdata=readFromFile(this.filename);
}

function WalletData() {
    this.encrypted = true;
    this.type = 'default';
    this.vcn = 0;
    this.coin_type = '0';
    this.testnet = false;
    this.prvkey = '';
    this.pubkey = '';
    this.password = '';
    this.address = '';
}

function init() {
    mkdirsSync(fp);
    var a = fs.existsSync(default_fullpath);
    console.log('isExist:', a);
    if (fs.existsSync(default_fullpath)) {
        console.log('default.cfg存在');
        var data = readFromFile(default_file, true);
        if (data && data['password']) {
            return new Wallet(data['password'], default_file);
        } else {
            console.log('wallet file not exist,need create new');
            return new Wallet();
        }
    } else {
        console.log('wallet file not exist,need create new');
        return new Wallet();
    }
}

function create(str) {// create loacl wallet *.cfg file 
    console.log(str);
    if (str.length < 16 || str.length > 32)
        throw new Error('phone+pwd length must be region in 16-32');
    var BIP32 = bip32.fromSeed(Buffer.from(str));
    pubkey = bufferhelp.bufToStr(BIP32.publicKey);
    var wif = BIP32.toWIF();
    var len = (wif.length).toString(16);
    wif = len + wif;
    var encrypt = AES.Encrypt(wif, this.password);
    address = genAddr(BIP32);//generate address
    saveToFile(encrypt, this.filename, this.password);//save to file
    return address;
}

function save(prvKeyStr) {//import prvkey to local *.fgfile
    console.log(prvKeyStr, prvKeyStr.length);
    if (prvKeyStr.length != 64)
        throw Error('length must be 64');
    var BIP32 = bip32.fromPrivateKey(bufferhelp.hexToBuffer(prvKeyStr), new Buffer(32));
    pubkey = bufferhelp.bufToStr(BIP32.publicKey);
    var wif = BIP32.toWIF();
    var len = (wif.length).toString(16);
    wif = len + wif;
    var encrypt = AES.Encrypt(wif, this.password);
    address = genAddr(BIP32);//generate address
    saveToFile(encrypt, this.filename, this.password);//save to file
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
    var filename = this.filename;
    var password = this.password;
    console.log('filename:', filename, password);
    if (password == undefined || filename == undefined) throw 'wallet error';
    var data = readFromFile(filename);
    var encrypt_prvkey = data['prvkey'];
    var s = AES.Decrypt(encrypt_prvkey, password);
    var n = bs58check.decode(s.slice(2));
    var prvKeyBuf = n.slice(1, 33);
    var BIP32 = bip32.fromPrivateKey(prvKeyBuf, new Buffer(32));
    return BIP32;
}

function getWalletData() {
    var wd = new WalletData();
    var data = readFromFile(this.filename);
    wd.coin_type = data['coin_type'];
    wd.encrypted = data['encrypted'];
    wd.password = data['password'];
    wd.prvkey = data['prvkey'];
    wd.pubkey = data['pubkey'];
    wd.type = data['type'];
    wd.vcn = data['vcn'];
    wd.testnet = data['testnet'];
    return wd;
}

function getAddrFromWallet() {
    var filename = this.filename;
    var password = this.password;
    console.log('filename:', filename, password);
    if (password == undefined || filename == undefined) throw 'wallet error';
    var data = readFromFile(filename);
    var encrypt_prvkey = data['prvkey'];
    var s = AES.Decrypt(encrypt_prvkey, password);
    var n = bs58check.decode(s.slice(2));
    var prvKeyBuf = n.slice(1, 33);
    var BIP32 = bip32.fromPrivateKey(prvKeyBuf, new Buffer(32));
    var addr = genAddr(BIP32);
    return addr;
}

function getWalletFileList() {
    return readDirSync(fp);
}

function validate() {
    var data = readFromFile(this.filename);
    if (data['password'] == this.password) {
        return true;
    }
    return false;
}

function readFromFile(filename, isDefault) {//read file
    console.log('isDefault:', isDefault);
    console.log('filename:', filename);
    var dir = '';
    if (isDefault == true || filename == default_file) {
        dir = default_fp;
    } else {
        dir = fp;
    }
    if (!filename.includes('.cfg')) {
        filename = filename + '.cfg';
    }
    console.log('dir:', dir);
    console.log('readFromFile filename:', filename);
    const data = fs.readFileSync(dir + filename, "utf-8");//sync read
    console.log('readFromFile data:', data);
    if (data && data.length > 0) {
        return JSON.parse(data);
    } else {
        // throw(filename+' data err');
        return null;
    }
}

function sign(buf) {
    var hash = bitcoinjs.crypto.sha256(buf);
    var wif = this.BIP32.toWIF();
    var keyPair = bitcoinjs.ECPair.fromWIF(wif);//sign with prvkey
    var signature = keyPair.sign(hash).toDER(); // ECSignature对象
    console.log(signature.toString('hex'), signature.toString('hex').length);
    //打印公钥以便验证签名:
    console.log(keyPair.getPublicKeyBuffer().toString('hex'));
    return signature;
}

function verify() {

}

function saveToFile(encrypt, filename, password) {//save file format *.cfg
    var data = {
        'encrypted': true,
        "type": "default",
        "vcn": 0,
        "coin_type": "00",
        "testnet": false,
        "prvkey": encrypt,
        "pubkey": pubkey == undefined ? '' : pubkey,
        "password": password,
        "address": address == undefined ? '' : address,
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

//递归创建目录 同步方法  
// function initdirs() {
//     if (fs.existsSync(fp)) {
//         return true;
//     } else {
//         if (mkdirsSync(path.dirname(fp))) {
//             fs.mkdirSync(fp);
//             return false;
//         }
//     }
// }

//递归创建目录 同步方法  
function mkdirsSync(dirname) {
    console.log(dirname);
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return false;
        }
    }
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

//遍历文件夹
function readDirSync(filepath) {
    var files = [];
    var pa = fs.readdirSync(filepath);
    pa.forEach(function (ele, index) {
        var info = fs.statSync(filepath + ele);
        if (info.isFile) {
            files.push(ele);
        }
    })
    return files;
}

module.exports = Wallet;