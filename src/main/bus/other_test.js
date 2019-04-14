

// var a='1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV';
// b = new Buffer.from(a);
// console.log(b,b.length);

const Wallet=require('./wallet')

// var wallet=new Wallet('123456','addr1');
// console.log(wallet.getBIP32());

// var wallet=new Wallet('1234','addr1.cfg');

// console.log('result:',wallet.validate());


var wallet = new Wallet();
wallet=wallet.init();
console.log(wallet);
