
// const types = require('./types');
// const bh = require('./bufferhelp');

// var offset = 0;

// function standard(type, value) {

//     if (typeof value == 'string') {
//         //字符串转二进制
//         bh.strToBuffer(value);

//     } else if (typeof value == 'number') {
//         switch (type) {
//             case 'B':
//                 bh.numToBuf(value, false, 1);
//                 break;
//             case 'I':
//                 bh.numToBuf(value, false, 4);
//                 break;
//         }
//     }
    // switch (type) {
    //     case 'B':
    //         bh.numToBuf(value, false, 1);
    //         break;
    //     case 'I':
    //         bh.numToBuf(value, false, 4);
    //         break;
    //     case ''
    //     default:
    //         break;
    // }
// }

// pack('<BBIBB3sBB1sBB19s', 1, 3, 4);