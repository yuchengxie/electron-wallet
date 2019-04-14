const { ipcMain } = require('electron')
const dhttp = require('dhttp');
const Wallet = require('./bus/wallet');
const message = require('./bus/message')
const bh = require('./bus/bufferhelp');

//set default wallet
var wallet = new Wallet();
wallet = wallet.init();

ipcMain.on('getwallets', function (event, data) {
    var list = wallet.getWalletFileList();
    //get wallet list
    event.sender.send('replygetwallets', list);
})

//update wallet
ipcMain.on('changewallet', function (event, data) {
    if (data.length == 2) {
        console.log('changewallet:', data);
        var currentfile=data[0]+'.cfg';
        var currentpassword=data[1];
        var w=new Wallet(currentpassword,currentfile);
        var result='';
        if(w.validate()){
            wallet=w;
            result='true';
        }else{
            result='false';
        }
        event.sender.send('replychangewallet', [result,wallet.filename]);
    }
})

ipcMain.on('save', function (event, data) {
    console.log(data);
    if (data.length == 3) {
        wallet = new Wallet(data[1], data[2]);
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
        console.log('pwd,filename:', data[1], data[2]);
        // wallet = new Wallet(data[1], data[2]);
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
    // var height = 20299;
    // var hash = '00...';
    var url = 'http://raw0.nb-chain.net/txn/state/block?&hash=0000000000000000000000000000000000000000000000000000000000000000&hi=30281'
    dhttp({
        url: url,
        method: 'GET'
    }, function (err, res) {
        if (err) throw 'getblock err';
        var buf = res.body;
        var payload = message.g_parse(buf);
        var msg = message.parseBlock(payload)[1];
        console.log('> msg:', msg);
        event.sender.send('replyblock', msg);
    })
})

ipcMain.on('info', function (event, data) {
    let pv = false;
    let pb = false;
    let after = 0;
    let before = 0;
    let address = '';
    console.log('wallet:', wallet);
    var addr = wallet.getAddrFromWallet();
    console.log('addr:', addr);

    var url = 'http://raw0.nb-chain.net/txn/state/account?addr=' + addr + '&uock=' + before + '&uock2=' + after;
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
            msg['account'] = bh.hexToBuffer(msg['account']).toString('latin1');
            console.log('> info msg:', msg);
            event.sender.send('replyinfo', msg);
        }
    )
})

ipcMain.on('utxo', function (event, data) {
    // var url = 'http://raw0.nb-chain.net/txn/state/uock?addr=1118hfRMRrJMgSCoV9ztyPcjcgcMZ1zThvqRDLUw3xCYkZwwTAbJ5o&num=5&uock2=[]';
    var addr = wallet.getAddrFromWallet();
    var url = 'http://raw0.nb-chain.net/txn/state/uock?addr=' + addr + '&num=5&uock2=[]';
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
            event.sender.send('replyutxo', msg);
        }
    )
})

ipcMain.on('transfer', function (event, data) {

    console.log(data);
})