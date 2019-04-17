

var s='';

var b=new Buffer(s,'hex');

var m=hexStrToBuffer(b);
console.log(m);

var a=1;

// hexStrToBuffer(s);

function hexStrToBuffer(hex) {
    if (hex=='') return new Buffer('');
    if (hex.length % 2 != 0) {
        hex = '0' + hex;
    }
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
    }))
    var buffer = typedArray.buffer
    buffer = Buffer.from(buffer);
    return buffer;
}