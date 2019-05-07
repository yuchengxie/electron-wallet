const { ipcMain } = require('electron')
const dhttp = require('dhttp');
const Wallet = require('./bus/wallet');
const message = require('./bus/message')
const bh = require('./bus/bufferhelp');
const bitcoinjs = require('bitcoinjs-lib');
const opscript=require('./bus/op/script');

var WEB_SERVER_ADDR = 'http://user1-node.nb-chain.net';
// var WEB_SERVER_ADDR = 'http://raw0.nb-chain.net';

//set default wallet

var wallet = new Wallet();

// wallet.init();

// var wallet = new Wallet('xieyc', 'default.cfg');
// var wallet ;

ipcMain.on('getwallets', function (event, data) {
    var list = wallet.getWalletFileList();
    //get wallet list
    event.sender.send('replygetwallets', list);
})

//update wallet
ipcMain.on('changewallet', function (event, data) {
    if (data.length == 2) {
        var currentpassword = data[0];
        var currentfile = data[1] + '.cfg';
        var result = '';
        if (wallet.changeWallet(currentfile, currentpassword)) {
            result = 'true';
        } else {
            result = 'false';
        }
        event.sender.send('replychangewallet', [result, currentfile]);
    }
})

ipcMain.on('save', function (event, data) {
    console.log(data);
    if (data.length == 3) {
        wallet = new Wallet(data[1], data[2]);
        console.log('>>> save data :', data[1], data[2]);
        console.log('>>> save after wallet:', wallet);

        var addr = wallet.save(data[0]);
        console.log(addr);
        if (addr) {
            event.sender.send('replysave', [addr, data[2]]);
        }
    } else {
        throw Error('import wallet data error');
    }
})

ipcMain.on('create', function (event, data) {
    console.log(data);
    if (data.length == 3) {
        wallet.password = data[1];
        wallet.filename = data[2];
        var addr = wallet.create(data[0]);
        if (addr) {
            event.sender.send('replycreate', [data[2], addr]);
        }
    } else {
        throw Error('create wallet data error');
    }
})

ipcMain.on('block', function (event, data) {
    // block_hash should be str or None
    var block_hash = data[0];
    var block_height = data[1];
    var height = '';
    if (block_height.length == 0) {
        //default heights
        var a = [-1, -2, -3];
        for (var i = 0; i < a.length; i++) {
            height += '&hi=' + a[i];
        }
    } else {
        height = '&hi=' + block_height;
    }
    var _hash = '';
    if (block_hash.length == 0) {
        for (let i = 0; i < 32; i++) {
            _hash += '00';
        }
    } else {
        _hash = block_hash;
        height = '';
    }
    var url = WEB_SERVER_ADDR + '/txn/state/block?&hash=' + _hash + height;
    dhttp({
        url: url,
        method: 'GET'
    }, function (err, res) {
        if (err) throw 'getblock err';
        var buf = res.body;
        var payload = message.g_parse(buf);
        var msg = message.parseBlock(payload)[1];
        console.log('> msg:', msg);

        var headers = msg['headers'];
        var blocks = [];
        for (var idx in headers) {
            var _block = {};
            _block.height = msg['heights'][idx];
            _block.txck = msg['txcks'][idx];
            _block.version = headers[idx]['version'];
            _block.link_no = headers[idx]['link_no'];
            _block.prev_block = headers[idx]['prev_block'];
            _block.merkle_root = headers[idx]['merkle_root'];
            _block.timestamp = headers[idx]['timestamp'];
            _block.bits = headers[idx]['bits'];
            _block.nonce = headers[idx]['nonce'];
            _block.miner = headers[idx]['miner'];
            _block.txn_count = headers[idx]['txn_count'];
            _block.hash = getHash(_block);
            blocks.push(_block);
        }
        event.sender.send('replyblock', blocks);
    })
})

ipcMain.on('info', function (event, data) {
    let pv = false;
    let pb = false;
    let after = 0;
    let before = 0;
    let address = '';
    var addr = data;
    console.log('info wallet:', wallet);
    if (addr.length == 0) {
        //setting default wallet address
        var d = wallet.getWalletData();
        if (d) {
            addr = d['address'];
        } else {
            console.log('info read data null');
            return;
        }
        console.log('>>> ready read wallet address:', addr);
        if (!addr) {
            return;
        }
    }
    console.log('>>> url addr:', addr);

    // var url = 'http://raw0.nb-chain.net/txn/state/account?addr=' + addr + '&uock=' + before + '&uock2=' + after;
    // var url = WEB_SERVER_ADDR + '/txn/state/account?addr=' + addr + '&uock=' + before + '&uock2=' + after;
    var url = WEB_SERVER_ADDR + '/txn/state/account?addr=' + addr;
    console.log('url:', url);
    dhttp(
        {
            url: url,
            method: 'GET'
        }, function (err, res) {
            if (err) throw 'getinfo err';
            var buf = res.body;
            var payload = message.g_parse(buf);
            var msg = message.parseInfo(payload)[1];
            var msg1 = {};
            msg1.account = bh.hexToBuffer(msg['account']).toString('latin1');
            msg1.timestamp = msg['timestamp'];
            msg1.link_no = msg['link_no'];
            var arrfound = [];
            var total = 0;
            for (var i = 0; i < msg['found'].length; i++) {
                var found_item = {};
                var m = msg['found'][i];
                var height = m['height'];
                var value = m['value'];
                var uock = m['uock'];
                //handle uock
                found_item.uock = uock;
                found_item.height = height;
                found_item.value = value;
                arrfound.push(found_item);
                total += value;
            }
            msg1.found = arrfound;
            msg1.total = total;
            console.log('> info msg:', msg1);
            event.sender.send('replyinfo', msg1);
        }
    )
})

ipcMain.on('utxo', function (event, data) {
    // var url = 'http://raw0.nb-chain.net/txn/state/uock?addr=1118hfRMRrJMgSCoV9ztyPcjcgcMZ1zThvqRDLUw3xCYkZwwTAbJ5o&num=2&uock2=[]';
    // var addr = wallet.getAddrFromWallet();
    var addr = '';
    var url = '';
    var d = wallet.getWalletData();
    if (d) {

        addr = d['address'];
        url = 'http://raw0.nb-chain.net/txn/state/uock?' + addr + '&num=2&uock2=[]';
    } else {
        //todo
        return;
    }
    console.log('utxo url:', url);
    // var url = 'http://raw0.nb-chain.net/txn/state/uock?addr=' + addr + '&num=5&uock2=[]';
    // var url = WEB_SERVER_ADDR + '/txn/state/uock?addr=' + addr + '&num=5&uock2=[]';
    // var url = WEB_SERVER_ADDR + '/txn/state/uock?addr=' + addr;
    // var url = WEB_SERVER_ADDR + '/txn/state/uock?addr=1118hfRMRrJMgSCoV9ztyPcjcgcMZ1zThvqRDLUw3xCYkZwwTAbJ5o&uock=[]';
    dhttp(
        {
            url: url,
            method: 'GET'
        }, function (err, res) {
            if (err) throw 'getutxo err';
            console.log('> utxo res:', res.body, res.body.length);
            var buf = res.body;
            var payload = message.g_parse(buf);
            console.log('> res:', payload, payload.length);
            var msg = message.parseUtxo(payload)[1];
            msg=utxoScript(msg);
            console.log('> msg:', msg);
            event.sender.send('replyutxo', msg);
        }
    )
})

var test = require('./bus/transfer')
ipcMain.on('transfer', function (event, data) {
    console.log(data);
    test.query_sheet('', '');
})

function getHash(_block) {
    console.log('_block:', _block);
    var version = new Buffer(4);
    version.writeInt32LE(_block['version']);
    var link_no = new Buffer(4);
    link_no.writeInt32LE(_block['link_no']);
    var prev_block = bh.hexStrToBuffer(_block['prev_block']);
    var merkle_root = bh.hexStrToBuffer(_block['merkle_root']);
    var timestamp = new Buffer(4);
    timestamp.writeInt32LE(_block['timestamp']);
    var bits = new Buffer(4);
    bits.writeInt32LE(_block['bits']);
    var nonce = new Buffer(4);
    nonce.writeInt32LE(_block['nonce']);
    var b = Buffer.concat([version, link_no, prev_block, merkle_root, timestamp, bits, nonce]);
    var h = bitcoinjs.crypto.hash256(b);
    return bh.bufToStr(h);
}

function getTotal(msg) {
    var total = 0;
    var found = msg['found'];
    for (var i = 0; i < found.length; i++) {
        total += found[i]['value'];
    }
    return total;
}

function utxoScript(msg) {
    var txns = msg['txns'];
    for (var i = 0; i < txns.length; i++) {
        var tx_outs = txns[i]['tx_out'];
        for (var j = 0; j < tx_outs.length; j++) {
            var pk_script = tx_outs[j]['pk_script'];
            // var t = new Tokenizer(s)._script;
            var s = opscript._process(pk_script);
            tx_outs[j]['pk_script'] = s;
        }
    }
    return msg;
}