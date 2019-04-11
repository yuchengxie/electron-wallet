var message = require('./message');
var gFormat = require('./format');
var dhttp = require('dhttp');

var bindMsg = message.bindMsg;
//binary测试
// 00 00 00 00 5f b8 ac 5c 36 31 31 31 38 4d 69 35 58 78 71 6d 71 54 42 70 37 54 6e 50 51 64 31 48 6b 
// 39 58 59 61 67 4a 51 70 44 63 5a 75 36 45 69 47 45 ...
// var m = {
//     link_no: 1,
//     timestamp: 1554798165,
//     account: '1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV',
//     search: 1024,
//     found: [
//         {
//             uock: 111,
//             value: 222,
//             height: 333
//         }
//     ]
// }
// console.log(m);
// var buf = new Buffer(0);
// msg = new bindMsg(gFormat.info);
// var b = msg.binary(m, buf);
// msg = new bindMsg(gFormat.info);
// var b = msg.parse(payload, 0);
// console.log('b:', b);


//parse测试
// var testBuf = Buffer('\x02\x11\x00\x00\x00\x11\x00\x00\x00');
// var testBuf = Buffer.from('02020101010101010100102a040201030502030203aa0d01001020304050607070201000000001010101020202', 'hex');
// console.log(testBuf, testBuf.length);
//测试数组
// var msg = new bindMsg(gFormat.txns)
// console.log(msg);
// var b = msg.parse(testBuf, 0);
// console.log(b);
//测试固定长度字符串
// var msg = new bindMsg(gFormat.S);
// var b = msg.parse(testBuf, 0);
// console.log(msg);
// console.log(b);
//测试变长字符串
// var msg = new bindMsg(gFormat.S);
// var b = msg.parse(testBuf, 0);
// console.log(b);
//测试一个对象
// msg = new bindMsg(gFormat.test1);
// var b = msg.parse(testBuf, 0);
// console.log('b:', b);


//测试info
// var URL = 'http://raw0.nb-chain.net/txn/state/account?addr=1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV&uock=0&uock2=0';
// dhttp({
//     method: 'GET',
//     url: URL,
// }, function (err, res) {
//     if (err) throw err;
//     buf = res.body;
//     //测试info
//     payload = buf.slice(24);
//     console.log('payload:', payload, payload.length);
//     msg = new bindMsg(gFormat.info);
//     var b = msg.parse(payload, 0);
//     console.log('b:', b);
// })

//测试utxo
// var URL = 'http://raw0.nb-chain.net/txn/state/account?addr=1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV&uock=0&uock2=0';
// var URL = 'http://raw0.nb-chain.net/txn/state/uock?addr=1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV&num=5&uock2=[]'
var URL = 'http://raw0.nb-chain.net/txn/state/uock?addr=1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV&num=5&uock2=[]'
dhttp({
    method: 'GET',
    url: URL,
}, function (err, res) {
    if (err) throw err;
    var buf = res.body;
    console.log('> res:', buf, buf.length);
    var payload = message.g_parse(buf);
    console.log('> res:', payload, payload.length);
    var msg = message.parseUtxo(payload)[1];
    console.log('> msg:', msg);
})