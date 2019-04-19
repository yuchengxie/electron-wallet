var s='0100000001329d1785a1233288907b46d2cb2a2f4d2f4f2f897c6927ec1a5bb96c08528421010000002876b8230000db83cf42e02199d4fa29d14a197a167ade519298f0c2f98ec5478092497bcd5c00b7acffffffff0200e1f505000000002876b8230000e5c7b20d5b5037f86e9861cd8795be42e8093c61bd36256a2b5a22df6508a8ba00b7ac707c59ec090000002876b8230000db83cf42e02199d4fa29d14a197a167ade519298f0c2f98ec5478092497bcd5c00b7ac0000000001000000'

const bh=require('../bufferhelp')
const Wallet=require('../wallet')
var hash_type = 1;
var payload=bh.hexToBuffer(s);
console.log(s);

var wallet = new Wallet('xieyc', 'default.cfg');
console.log('wallet:',wallet);
var sig = Buffer.concat([wallet.sign(payload), CHR(hash_type)]);
console.log('sig:', sig, sig.length,bh.bufToStr(sig));
// var pub_key = wallet.getBIP32().publicKey;


function CHR(buf) {
    var b = new Buffer(1);
    var len = buf.length;
    b.writeInt8(len);
    return b;
}
