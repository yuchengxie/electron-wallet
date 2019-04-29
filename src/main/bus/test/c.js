
// const bitcoin = require("bitcoinjs-lib");
// const bh = require("../bufferhelp");


// var message_s = "010000000131a66dd0de9f7f68936a1058ecc1c6c623018f73deca93744b4124ed9fb6aa0f010000002876b8230000db83cf42e02199d4fa29d14a197a167ade519298f0c2f98ec5478092497bcd5c00b7acffffffff0200e1f505000000002876b8230000e5c7b20d5b5037f86e9861cd8795be42e8093c61bd36256a2b5a22df6508a8ba00b7aca0ff2d6f090000002876b8230000db83cf42e02199d4fa29d14a197a167ade519298f0c2f98ec5478092497bcd5c00b7ac0000000001000000";
// var message=bh.hexStrToBuffer(message_s);
// // message='a secret message!';
// // message='a abc!';

// let 
//   hash = bitcoin.crypto.sha256(message),
//   wif = "L16zYACWmkQXMUhYAzLA1dWEg95yv8VokSVFcadgpMFeTQoDzMPz",
//   keyPair = bitcoin.ECPair.fromWIF(wif);
// // 用私钥签名:
// let signature = keyPair.sign(hash).toDER(); // ECSignature对象
// // 打印签名:
// console.log(signature.toString("hex"),signature.length);
// // 打印公钥以便验证签名:
// console.log('公钥:',keyPair.getPublicKeyBuffer().toString("hex"));

// verify();

// function verify() {
//   let signAsStr =
//     "3045022100d3fcd05aed64d7f7684dd9" +
//     "21b11f3b4a10fb07c1418e458a43aaef" +
//     "64bf19d48802205a3bbe9a69b83a00c8" +
//     "55b4a882b71c7af9c9ef03e1f62ff7f6" +
//     "83378d42b2a994";

//   let signAsBuffer = Buffer.from(signAsStr, "hex"),
//     signature = bitcoin.ECSignature.fromDER(signAsBuffer), // ECSignature对象
//     // message = "a secret message!",
//     hash = bitcoin.crypto.sha256(message),
//     pubKeyAsStr =
//       "0319e2c444740d73d54387d711306356bbc89c7a31b87749bedc6f8f07d5810004",
//     pubKeyAsBuffer = Buffer.from(pubKeyAsStr, "hex"),
//     pubKeyOnly = bitcoin.ECPair.fromPublicKeyBuffer(pubKeyAsBuffer); // 从public key构造ECPair

//   // 验证签名:
//   let result = pubKeyOnly.verify(hash, signature);
//   console.log("Verify result: " + result);
// }


var a = new Buffer('abc123').reverse();
var t = 0;
for (var i = 0; i < a.length; i++) {
  var b = a[i];
  t += b << (8 * i);

  console.log(b);
  console.log(t);
}
// console.log(t);

