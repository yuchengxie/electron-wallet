const { ipcMain } = require('electron')
const Wallet = require('./bus/wallet');
const dhttp = require('dhttp');
const message = require('./bus/message')
const bh=require('./bus/bufferhelp');
// let file = require('../utils/file')
// let infoparse = require('../parse/walletinfoparse');
// let blockparse=require('../parse/blockparse');
// let utxoparse=require('../parse/utxoparse');
// let http=require('http');

var wallet;

ipcMain.on('save', function (event, data) {
    console.log(data);
    if (data.length == 2) {
        if (data[1].length == 0) throw Error('password can not be empty');
        wallet = new Wallet(data[1]);
        var addr = wallet.save(data[0]);
        console.log(addr);
        if (addr) {
            event.sender.send('replysave', addr);
        }
    } else {
        throw Error('import wallet data error');
    }
})

ipcMain.on('create', function (event, data) {
    console.log(data);
    if (data.length == 2) {
        if (data[1].length == 0) throw Error('password can not be empty');
        wallet = new Wallet(data[1]);
        var addr = wallet.create(data[0]);
        if (addr) {
            event.sender.send('replycreate', addr);
        }
    } else {
        throw Error('create wallet data error');
    }


})

// ipcMain.on('block',function(event,data){
//     var height=20299;
//     var hash='00...';
//     var URL = 'http://raw0.nb-chain.net/txn/state/block?&hash=0000000000000000000000000000000000000000000000000000000000000000&hi=20299'

//     console.log('URL:', URL);
//     http.get(URL, function (req) {
//         req.headers = {
//             'Content-Type': 'application/x-www-form-urlencoded',
//         }
//         req.timeout = 30;
//         var arr = [];
//         req.on('data', function (chunk) {
//             arr.push(chunk);
//         });
//         req.on('end', function () {
//             var b = arr[0];
//             for (var i = 1; i < arr.length; i++) {
//                 b0 = Buffer.concat(b0, arr[i]);
//             }
//             console.log('b:', b, b.length, b.toString('hex'));
//             var block=blockparse.parse(b);
//             // var obj=p.parse(b);
//             // console.log('obj:',obj);
//             event.sender.send('replyblock',block);
//         });
//     });


// })

ipcMain.on('block', function (event, data) {
    // var height = 20299;
    // var hash = '00...';
    var URL = 'http://raw0.nb-chain.net/txn/state/block?&hash=0000000000000000000000000000000000000000000000000000000000000000&hi=20299'
    dhttp({
        url: url,
        method: 'GET'
    }, function (err, res) {
        if (err) throw 'getinfo err';
        var buf = res.body;
        var payload = message.g_parse(buf);
        var msg = message.parseInfo(payload)[1];
        console.log('> msg:', msg);
        event.sender.send('replyblock',block);
    })
})

ipcMain.on('info', function (event, data) {
    wallet = new Wallet('111111', 'addr1');
    let pv = false;
    let pb = false;
    let after = 0;
    let before = 0;
    let address = '';
    console.log('wallet:', wallet);
    var addr = wallet.getAddrFromWallet();
    console.log('addr:', addr);

    var url = 'http://raw0.nb-chain.net/txn/state/account?addr=1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV&uock=0&uock2=0'
    // var url = 'http://raw0.nb-chain.net/txn/state/account?addr=' + addr + '&uock=' + before + '&uock2=' + after;
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
            msg['account']= bh.hexToBuffer(msg['account']).toString('latin1');
            console.log('> info msg:', msg);
            event.sender.send('replyinfo', msg);
        }
    )
})

ipcMain.on('utxo', function (event, data) {
    // utxo(account, password, num, uock, address);
    // var addr = file.readAccount(account, password);
    // var uocks=5;
    // 1119AwBxBnRX3SdNM67EwPGb9CmSTUcP3qk7hhNVUuSGdXJGLjEnis
    // 1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV
    var url = 'http://raw0.nb-chain.net/txn/state/uock?addr=1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV&num=5&uock2=[]';
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
            console.log('> msg:', msg);
            if (msg) {
                event.sender.send('replyutxo', msg);
            }
        }
    )
})

// /**
//  * test
//  */
// ipcMain.on('test', function (event, data) {
//     console.log('data:', data);
// })
// ipcMain.on('test2', function (event, data) {
//     console.log('data:', data);
// })