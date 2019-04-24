
let http = require('http');
var dhttp = require('dhttp');
var message = require('./message');
var gFormat = require('./format');
var Wallet = require('./wallet');
const bufferhelp = require('./bufferhelp');
const sha256 = require('js-sha256');
const bitcoinjs = require('bitcoinjs-lib')
const bs58 = require('bs58');
const makesheetbinary = require('./makesheet');
const transbinary = require('./transaction');
const async = require('async')

var bindMsg = message.bindMsg;
var seq = 0;
var WEB_SERVER_ADDR = 'http://user1-node.nb-chain.net';
// var WEB_SERVER_ADDR = 'http://raw0.nb-chain.net';


//交易测试

var command_type = 'makesheet';
var magic = Buffer.from([0xf9, 0x6e, 0x62, 0x74]);
var sequence = 0;
var makesheet;
var orgsheetMsg;
var _wait_submit = [];
var SHEET_CACHE_SIZE = 16;
var wallet;
var submit = true;

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

function PayFrom() {
	this.value = 0;
	this.address = '';
}
function PayTo() {
	this.value = 0;
	this.address = '';
}

async function query_sheet(pay_to, from_uocks) {
	var ext_in = null;
	var submit = true;
	var scan_count = 0;
	var min_utxo = 0;
	var max_utxo = 0;
	var sort_flag = 0;
	var from_uocks = null;
	var buf = prepare_txn1_(pay_to, ext_in, scan_count, min_utxo, max_utxo, sort_flag, from_uocks);

	console.log('>>> 发送数据:', buf, buf.length, bufferhelp.bufToStr(buf))
	var URL = WEB_SERVER_ADDR + '/txn/sheets/sheet';
	dhttp({
		method: 'POST',
		url: URL,
		body: buf
	}, function (err, res) {
		if (err) {
			seq = 0;
			return;
		};
		var resbuf = res.body;
		var s = bufferhelp.bufToStr(resbuf);
		console.log('>>> 接收数据1:', resbuf, s, s.length);
		var payload = message.g_parse(resbuf);
		console.log('payload:', payload, payload.length);
		var msg = new bindMsg(gFormat.orgsheet);

		orgsheetMsg = msg.parse(payload, 0)[1];
		console.log('>>>>>> orgsheetMsg:', orgsheetMsg);

		//check pay_to balance

		var d = {};
		var payto = makesheet.pay_to;
		for (var i = 0; i < payto.length; i++) {
			var p = payto[i];
			if (p.value != 0 || p.address.slice(0, 1) != 0x6a) {
				var ret = decode_check(p.address);
				ret = bufferhelp.bufToStr(ret);
				d[ret] = p.value;
			}
		}

		console.log('d:', d);
		// var t = orgsheetMsg.pks_outs

		var pks_out0 = orgsheetMsg.pks_out[0].items;
		// var b_pks_out0=bufferhelp.hexStrToBuffer(pks_out0);
		// var pks_num = pks_out0.length;
		var pks_num = orgsheetMsg.pks_out.length;
		var tx_ins2 = [];

		var tx_In = orgsheetMsg.tx_in;
		for (var idx = 0; idx < tx_In.length; idx++) {
			var tx_in = tx_In[idx];
			// # sign every inputs
			if (idx < pks_num) {
				var hash_type = 1;
				//transaction
				var payload = make_payload(pks_out0, orgsheetMsg.version, orgsheetMsg.tx_in, orgsheetMsg.tx_out, 0, idx, hash_type)  //lock_time=0
				//签名
				console.log('>>> ready sign payload:', payload, bufferhelp.bufToStr(payload), payload.length);
				wallet = new Wallet('xieyc', 'default.cfg');
				// console.log('wallet:', wallet);
				// var sig=wallet.sign(payload);
				// var h=CHR(hash_type);
				var sig = Buffer.concat([wallet.sign(payload), CHR(hash_type)]);
				console.log('sig:', sig, sig.length, bufferhelp.bufToStr(sig));
				// var pub_key = wallet.getBIP32().publicKey;
				var pub_key = wallet.BIP32.publicKey;
				console.log('pub_key:', pub_key, pub_key.length);
				var sig_script = Buffer.concat([CHR(sig.length), sig, CHR(pub_key.length), pub_key]);
				console.log('sig_script:', sig_script, sig_script.length, bufferhelp.bufToStr(sig_script));
				var txin = new TxnIn();
				// tx_in.prev_output, sig_script, tx_in.sequence
				txin.prev_output = tx_in.prev_output;
				txin.sig_script = bufferhelp.bufToStr(sig_script);
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
		txn.sig_raw = '';
		console.log('>>> txn msg:', txn);
		//Transaction binary2
		var txn_payload = transbinary.compayloadTran(txn);

		//txn payload magic
		var txn_binary = message.g_binary(txn_payload, 'tx');
		console.log('>>> txn_binary:', txn_binary, txn_binary.length, bufferhelp.bufToStr(txn_binary));

		//payload  hashds excludes raw_script
		var hash_ = bitcoinjs.crypto.sha256(bitcoinjs.crypto.sha256(txn_binary.slice(24, txn_binary.length - 1)));

		console.log('>>> hash_:', hash_, hash_.length, bufferhelp.bufToStr(hash_));
		var state_info = [orgsheetMsg.sequence, txn, 'requested', hash_, orgsheetMsg.last_uocks];
		_wait_submit.push(state_info);
		while (_wait_submit.length > SHEET_CACHE_SIZE) {
			_wait_submit.remove(_wait_submit[0]);
		}

		if (submit) {
			var unsign_num = orgsheetMsg.tx_in.length - pks_num
			if (unsign_num != 0) { // leaving to sign
				console.log('Warning: some input not signed: %i', unsign_num);
				//return 0
			} else {
				//post request
				var URL = WEB_SERVER_ADDR + '/txn/sheets/txn';
				// var URL = 'http://raw0.nb-chain.net/txn/sheets/txn';
				dhttp({
					method: 'POST',
					url: URL,
					body: txn_binary
				}, function (err, res) {
					if (err) throw ('err txn/sheets/txn');
					console.log('txn_binary:', txn_binary, txn_binary.length, bufferhelp.bufToStr(txn_binary));
					console.log('>>> msg3', res.body);
					var payload = message.g_parse(res.body);
					var m = new bindMsg(gFormat.udpconfirm);
					var msg3 = m.parse(payload, 0)[1];
					console.log('msg3:', msg3);
					console.log('msg3[hash]:', msg3['hash'], msg3['hash'].length);
					console.log('>>> hash_:', hash_, hash_.length, bufferhelp.bufToStr(hash_));
					// console.log('bufferhelp.bufToStr(hash_):',bufferhelp.bufToStr(hash_));
					if (msg3['hash'] == bufferhelp.bufToStr(hash_)) {
						state_info[2] = 'submited';
						seq = orgsheetMsg.sequence;
						// var a=1;
						var sn = seq;
						if (sn) {
							var info = submit_info(sn);
							var state = info[2];
							// var txn_hash0 = info[3];
							var txn_hash = bufferhelp.bufToStr(info[3]);
							var last_uocks = info[4];
							if (state == 'submited' && txn_hash) {
								var sDesc = '\nTransaction state:' + state;
								if (last_uocks) {
									sDesc += ',last uock: ' + last_uocks[0];
									console.log(sDesc);
								}
							}
							if (txn_hash) {
								var url = WEB_SERVER_ADDR + '/txn/sheets/state?hash=' + txn_hash;
								// var url = 'http://raw0.nb-chain.net/txn/sheets/state?hash=' + txn_hash
								setInterval(() => {
									dhttp({
										method: 'GET',
										url: url,
									}, function (err, res) {
										// console.log(res);
										if (res.statusCode == 400) {
											var payload = message.g_parse(res.body);
											var msg = new bindMsg(gFormat.udpreject);
											var sErr = msg.parse(payload, 0)[1];
											// console.log('sErr:', sErr);
											var s = sErr['message'];
											var b = bufferhelp.hexStrToBuffer(s);
											var m = b.toString('latin1');
											if (m === 'in pending state') {
												console.log('pending...\n');
											} else {
												console.log('Error: ' + sErr);
											}
										} else if (res.statusCode = 200) {
											var payload = message.g_parse(res.body);
											var msg = new bindMsg(gFormat.udpconfirm);
											var confirmsg = msg.parse(payload, 0)[1];
											if (confirmsg.hash == hash_) {
												var hi = confirmsg['arg'] & 0xffffffff;
												var num = (confirmsg['arg'] >> 32) & 0xffff;
												var idx = (confirmsg['arg'] >> 48) & 0xffff;
												var state = 'confirm=' + num + ' height=' + hi + ' idx=' + idx;
												console.log('state:',state);
											}
										}
									})
								}, 10000);
							}
						}
					}
				})
			}
		}
	})
	// console.log('seq:', seq);
}

function submit_info(sn) {
	// var state_info = [orgsheetMsg.sequence, txn, 'requested', hash_, orgsheetMsg.last_uocks];
	for (var i = 0; i < _wait_submit.length; i++) {
		var info = _wait_submit[i];
		if (info[0] == sn) {
			return info;
		}
	}
}


function prepare_txn1_(pay_to, ext_in, scan_count, min_utxo, max_utxo, sort_flag, from_uocks) {
	sequence += 1;

	var pay_from = [];
	var pay_from1 = new PayFrom();
	pay_from1.value = 0;
	pay_from1.address = '1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV';
	pay_from.push(pay_from1);

	var pay_to = [];
	var pay_to1 = new PayTo()
	pay_to1.value = 1 * Math.pow(10, 8);
	pay_to1.address = '1118hfRMRrJMgSCoV9ztyPcjcgcMZ1zThvqRDLUw3xCYkZwwTAbJ5o';
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

//将makesheet对象转二进制流
function submit_txn_(msg, submit) {
	//0-4
	const magic = Buffer.from([0xf9, 0x6e, 0x62, 0x74]);
	//4-16
	var command = new Buffer(12);
	command.write('makesheet', 0);
	console.log('> msg:', msg);

	var payload = makesheetbinary.compayload(msg);

	console.log('makesheet to payload buf\n:', payload, bufferhelp.bufToStr(payload), payload.length);
	//16-20 payload length
	var len_buf = new Buffer(4);
	var len = payload.length;
	len_buf.writeInt32LE(len);
	// //20-24 checksum
	var checksum = bufferhelp.hexToBuffer(sha256(bufferhelp.hexToBuffer(sha256(payload)))).slice(0, 4);
	var b = Buffer.concat([magic, command, len_buf, checksum, payload]);
	return b;
}

//流的转换
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
			console.log('>>> script:', script, script.length);

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

	console.log('>>> tx_copy msg:', tx_copy);
	// var payload = parse(tx_copy);
	// var msg = new bindMsg(gFormat.flextxn);
	// var payload = msg.binary(tx_copy, new Buffer(0));

	var payload = transbinary.compayloadTran(tx_copy);
	//hash_type to I
	var hash_type_buf = bufferhelp.numToBuf(hash_type, false, 4);
	// var s=bufferhelp.bufToStr(hash_type_buf);
	var b = Buffer.concat([payload, hash_type_buf]);

	console.log('tx_copy payload:', b, bufferhelp.bufToStr(b), b.length);
	return b;
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

function CHR(n) {
	var buf = new Buffer(1);
	buf.writeInt8(n);
	return buf;
}
// function CHR(buf) {
//     var b = new Buffer(1);
//     var len = buf.length;
//     b.writeInt8(len);
//     return b;
// }

// 测试
var pay_to = '', from_uocks = '';
var ret = query_sheet(pay_to, from_uocks);

module.exports = {
	query_sheet
}

