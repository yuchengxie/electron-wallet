let http = require('http');
var dhttp = require('dhttp');
var message = require('./message');
var gFormat = require('./format');
var Wallet = require('./wallet');
const bufferhelp = require('./bufferhelp');
const sha256 = require('js-sha256');
const bs58 = require('bs58');

var bindMsg = message.bindMsg;


//交易测试

var command_type = 'makesheet';
var magic = Buffer.from([0xf9, 0x6e, 0x62, 0x74]);
var sequence = 0;
var makesheet;
var orgsheetMsg;
var _wait_submit = [];
var SHEET_CACHE_SIZE = 16;

function verify(addr) {
    if (addr.length <= 32) {
        throw Error('invalid address');
        return false;
    };
    for (var i = 0; i < addr.length; i++) {
        var ch = addr[i];
        if (_BASE58_CHAR.indexOf(ch) == -1) {
            throw Error('invalid address');
        }
    }
    return true;
}

function FlexTxn() {
    this.version = 0;
    this.tx_in = [];
    this.tx_out = [];
    this.lock_time = 0;
}

function Transaction() {
    this.version = 0;
    this.tx_in = [];
    this.tx_out = [];
    this.lock_time = 0;
    this.sig_raw = '';
}

function TxnIn() {
    this.prev_output = '';
    this.sig_script = '';
    this.sequence = 0;
}


function MakeSheet() {
    this.vcn = 0;
    this.sequence = 0;
    this.pay_from = [];
    this.pay_to = [];
    this.scan_count = 0;
    this.min_utxo = 0;
    this.max_utxo = 0;
    this.sort_flag = 0;
    this.last_uocks = [];
}

function query_sheet(pay_to, from_uocks) {
    var ext_in = null;
    var submit = true;
    var scan_count = 0;
    var min_utxo = 0;
    var max_utxo = 0;
    var sort_flag = 0;
    var from_uocks = null;
    return prepare_txn1_(pay_to, ext_in, scan_count, min_utxo, max_utxo, sort_flag, from_uocks);
}
function PayFrom() {
    this.value = 0;
    this.address = '';
}
function PayTo() {
    this.value = 0;
    this.address = '';
}
function prepare_txn1_(pay_to, ext_in, scan_count, min_utxo, max_utxo, sort_flag, from_uocks) {
    // if (!WEB_SERVER_ADDR) {
    //     return null;
    // }
    sequence += 1;

    var pay_from = [];
    var pay_from1 = new PayFrom();
    pay_from1.value = 0;
    pay_from1.address = '1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV';
    pay_from.push(pay_from1);

    var pay_to = [];
    var pay_to1 = new PayTo()
    pay_to1.value = 100000000;
    pay_to1.address = '1119AwBxBnRX3SdNM67EwPGb9CmSTUcP3qk7hhNVUuSGdXJGLjEnis';
    pay_to.push(pay_to1);


    makesheet = new MakeSheet();
    makesheet.vcn = 0;
    makesheet.sequence = sequence;
    makesheet.pay_from = pay_from;
    makesheet.pay_to = pay_to;
    makesheet.scan_count = scan_count;
    makesheet.min_utxo = min_utxo;
    makesheet.max_utxo = max_utxo;
    makesheet.sort_flag = sort_flag;
    // makesheet.from_uocks=from_uocks;
    makesheet.last_uocks = [0];
    return submit_txn_(makesheet, true);
}

function submit_txn_(msg, submit) {
    //0-4
    const magic = Buffer.from([0xf9, 0x6e, 0x62, 0x74]);
    //4-16
    var command = new Buffer(12);
    command.write('makesheet', 0);
    console.log('> msg:', msg);

    //begin 数据组包
    // var m = new bindMsg(gFormat.makesheet);
    var buf = new Buffer(0);
    var _msg = new bindMsg(gFormat.makesheet);
    var payload = _msg.binary(msg, buf);
    console.log('payload:', payload, payload.length);

    //16-20 payload length
    var len_buf = new Buffer(4);
    var len = payload.length;
    len_buf.writeInt32LE(len);
    // //20-24 checksum
    var checksum = bufferhelp.hexToBuffer(sha256(bufferhelp.hexToBuffer(sha256(payload)))).slice(0, 4);

    var b = Buffer.concat([magic, command, len_buf, checksum, payload]);

    return b;
}

var pay_to = '', from_uocks = '';

var buf = query_sheet(pay_to, from_uocks)
console.log('发送buf:', buf, buf.length);
var URL = 'http://raw0.nb-chain.net/txn/sheets/sheet';
dhttp({
    method: 'POST',
    url: URL,
    body: buf
}, function (err, res) {
    if (err) throw err;
    var resbuf = res.body;
    console.log('resbuf:', resbuf, resbuf.length);
    var payload = message.g_parse(resbuf);
    console.log('payload:', payload, payload.length);
    var msg = new bindMsg(gFormat.orgsheet);
    orgsheetMsg = msg.parse(payload, 0)[1];
    console.log('>>>>>> orgsheetMsg:', orgsheetMsg);


    var d = {};
    var payto = makesheet.pay_to
    for (var i = 0; i < payto.length; i++) {
        var p = payto[i];
        if (p.value != 0 || p.address.slice(0, 1) != 0x6a) {
            var ret = decode_check(p.address);
            ret = bufferhelp.bufToStr(ret);
            d[ret] = p.value;
        }
    }


    var t = orgsheetMsg.pks_out;

    var pks_out0 = orgsheetMsg.pks_out[0].items;
    var pks_num = pks_out0.length;
    var tx_ins2 = [];

    var tx_In = orgsheetMsg.tx_in;
    for (var idx = 0; idx < tx_In.length; idx++) {
        var tx_in = tx_In[idx];
        // # sign every inputs
        if (idx < pks_num) {
            var hash_type = 1;
            var payload = make_payload(pks_out0[idx], orgsheetMsg.version, orgsheetMsg.tx_in, orgsheetMsg.tx_out, 0, idx, hash_type)  //lock_time=0
            // //签名
            console.log('payload:', payload, payload.length);
            // var wallet = new Wallet('123456', 'addr1');
            var wallet=new Wallet('xieyc','default.cfg');
            console.log('wallet:', wallet);
            var BIP32 = wallet.getBIP32();
            console.log('>>> bip32:', BIP32);
            var sig = Buffer.concat([wallet.sign(BIP32, payload), CHR(hash_type)]);
            console.log('sig:', sig, sig.length);
            var pub_key = BIP32.publicKey;
            console.log('pub_key:', pub_key, pub_key.length);
            var sig_script = Buffer.concat([CHR(sig), sig, CHR(pub_key), pub_key]);
            console.log('sig_script:', sig_script, sig_script.length);
            var txin = new TxnIn();
            tx_in.prev_output, sig_script, tx_in.sequence
            txin.prev_output = tx_in.prev_output;
            txin.sig_script = tx_in.sig_script;
            txin.sequence = tx_in.sequence;
            tx_ins2.push(txin);
        }
    }
    console.log('tx_ins2:', tx_ins2, tx_ins2.length);

    var txn = new Transaction();
    txn.version = orgsheetMsg.version;
    txn.tx_in = tx_ins2;
    txn.tx_out = orgsheetMsg.tx_out;
    txn.lock_time = orgsheetMsg.lock_time;
    txn.sig_raw = '0';

    var buf = new Buffer(0);
    var msg = new bindMsg(gFormat.transaction);
    var p = msg.binary(txn, buf);
    var p_buf = message.g_binary(p, 'transaction');

    console.log('>>> tranmsg:', txn);
    console.log('>>> p payload:', p, p.length);
    console.log('>>> txn payload:', p_buf, p_buf.length);
    //paylaod  hashds
    var hash_ = bufferhelp.hexToBuffer(sha256(bufferhelp.hexToBuffer(sha256(p))));
    console.log('>>> hash_:', hash_, hash_.length);
    var state_info = [orgsheetMsg.sequence, txn, 'requested', hash_, orgsheetMsg.last_uocks];
    _wait_submit.push(state_info);
    // while (_wait_submit.length > self.SHEET_CACHE_SIZE){
    //     _wait_submit
    // }
    if (submit){
        unsign_num = len(msg2.tx_in) - pks_num
    }
})

function CHR(buf) {
    var b = new Buffer(1);
    var len = buf.length;
    b.writeInt8(len);
    return b;
}

function make_payload(subscript, txns_ver, txns_in, txns_out, lock_time, input_index, hash_type) {
    var tx_outs;
    var tx_ins = [];
    // SIGHASH_ALL
    if ((hash_type & 0x1F) == 0x01) {
        for (var index = 0; index < txns_in.length; index++) {
            var tx_in = txns_in[index];
            var script = '';
            if (index == input_index) {
                script = subscript;
            }
            tx_in.sig_script = script;
            tx_ins.push(tx_in);
        }
        tx_outs = txns_out;
    }

    // console.log('tx_outs:', tx_outs);
    if (tx_ins == null || tx_outs == null) {
        throw Error('invalid signature type');
    }

    var tx_copy = new FlexTxn();
    tx_copy.version = txns_ver;
    tx_copy.tx_in = tx_ins;
    tx_copy.tx_out = tx_outs;
    tx_copy.lock_time = lock_time;

    // var payload = parse(tx_copy);
    var msg = new bindMsg(gFormat.flextxn);
    var payload = msg.binary(tx_copy, new Buffer(0));
    // console.log('payload:', payload, payload.length);
    return payload;

}

function decode_check(v) {
    var a = bs58.decode(v);
    var ret = a.slice(0, a.length - 4);
    var check = a.slice(a.length - 4);
    var checksum = bufferhelp.hexToBuffer(sha256(bufferhelp.hexToBuffer((sha256(ret)))));
    if (checksum.compare(check) == 1) {
        return ret.slice(1);
    }
}