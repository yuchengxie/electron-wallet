// var s='0100000001329d1785a1233288907b46d2cb2a2f4d2f4f2f897c6927ec1a5bb96c08528421010000002876b8230000db83cf42e02199d4fa29d14a197a167ade519298f0c2f98ec5478092497bcd5c00b7acffffffff0200e1f505000000002876b8230000e5c7b20d5b5037f86e9861cd8795be42e8093c61bd36256a2b5a22df6508a8ba00b7ac707c59ec090000002876b8230000db83cf42e02199d4fa29d14a197a167ade519298f0c2f98ec5478092497bcd5c00b7ac0000000001000000'

const bh = require('../bufferhelp')
const bitcoinjs=require('bitcoinjs-lib');
// const Wallet=require('../wallet')
// var hash_type = 1;
// var payload=bh.hexToBuffer(s);
// console.log(s);

// var wallet = new Wallet('xieyc', 'default.cfg');
// console.log('wallet:',wallet);
// var sig = Buffer.concat([wallet.sign(payload), CHR(hash_type)]);
// console.log('sig:', sig, sig.length,bh.bufToStr(sig));
// // var pub_key = wallet.getBIP32().publicKey;


// function CHR(buf) {
//     var b = new Buffer(1);
//     var len = buf.length;
//     b.writeInt8(len);
//     return b;
// }

// var request = require('request');
// var url = 'http://www.baidu.com';
// request('http://www.baidu.com', function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(response.headers) // Show the HTML for the baidu homepage.
//   }
// })

// request({
//     url: url,
//     method: "GET",
//     json: true,
//     headers: {
//         "content-type": "application/json",
//     },
//     // body: JSON.stringify(requestData)
// }, function(error, response, body) {
//     if (!error && response.statusCode == 200) {
//         console.log(response.headers)
//     }
// }); 

// request.post({ url: url, form: { key: 'value' } }, function (error, response, body) {
//     console.log(response.statusCode)
//     if (!error && response.statusCode == 200) {
//         console.log(response.headers)
//     }
// })


// var s='696e2070656e64696e67207374617465'
// var buf=bh.hexStrToBuffer(s);
// var m=buf.toString('latin1');
// console.log(m);

// var a=1;

// in pending state

// var s=25 & 0x10

// console.log(s);

// var state = 'confirm=%d, height=%d, index=%d'+(10, 2, 3)
// console.log(state);

// function trim(s) {
//     var count = s.length;
//     var st = 0;
//     var end = count - 1;
//     if (s == '') return s;
//     while (st < count) {
//         if (s.charAt(st) == ' ') {
//             st++;
//         } else {
//             break;
//         }
//     }
//     while (end > st) {
//         if (s.charAt(end) == ' ') {
//             end--;
//         } else {
//             break;
//         }
//     }
//     return s.substring(st,end+1);
// }


// var s0=' abc 123  111';
// var s1=trim(s0);
// console.log(s0);
// console.log(s1);

// var s = ''
// for (let i = 0; i < 32; i++) {
//     s += '00';
// }

// console.log(s);

// var b = [-1, -2];
// var s=''
// for(hi in b){
//     s+='&hi='+hi;
// }
// console.log('s:',s);

// var b=new Buffer('abcd');
// const sha256=require('js-sha256');
// var b=new Buffer('abcdefghabcdefghabcdefghabcdefgh');
// var b=new Buffer('abcd');

// console.log(b);
// var a=bitcoinjs.crypto.sha256(b);
// // var c=sha256(b);
// console.log('>>> 1:',a,bh.bufToStr(a));
// console.log('>>> 2:',c);

// var a=[-1,-2];
// var s='';
// for(var i=0;i<a.length;i++){
//     s+='&hi='+a[i];
// }

// console.log(s);

// var a=new Buffer(32);
// console.log(bh.bufToStr());



