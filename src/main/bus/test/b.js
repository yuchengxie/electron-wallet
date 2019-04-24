


var dhttp = require('dhttp');
var asyns = require('async');

function t1() {
    dhttp({
        url: 'http://www.baidu.com'
    }, function (err, res) {
        console.log('t1 res1 ok');
    });
}

function t2() {
    dhttp({
        url: 'http://www.baidu.com'
    }, function (err, res) {
        console.log('t2 res2 ok');
    })
}

function t3() {
    console.log('t3...');
}

function t4() {
    console.log('t4...');

}

function test() {
    var m = t1();
    var n = t2();
    m.then((res) => {
        t3();
    })
    // t3();
    // t4();
}
// test();


// var co = require('co');
// //登录请求
// let loginReq = new Promise((resolve, reject) => {
//     setTimeout(function () {
//         console.log('1111');
//         resolve({ success: true })
//     }, 2000)
// })

// console.log(loginReq);

// let userInfoReq = new Promise((resolve, reject) => {
//     setTimeout(function () {
//         resolve({ nickName: 'dounine' })
//     }, 2000)
// });

// loginReq.then(res=>{
//     if(res.success){
//         userInfoReq.then(res=>{
//             console.log(res.nickName);
//         })
//     }
// })
// loginReq;
// userInfoReq;

// co(function* () {
//     let loginInfo = yield loginReq;
//     if (loginInfo.success) {
//         let userinfo = yield userInfoReq;
//         console.log('ok');
//     }
// })


function runAsync1() {
    var promise = new Promise(function (resolve, reject) {
        console.log('getin runAsync1');
        dhttp({
            url: 'http://www.baidu.com'
        }, function (err, res) {
            console.log('runAsync1 ok');
            resolve(res);

        });
    });
    return promise;
}

function runAsync2(){
    var promise = new Promise(function (resolve, reject) {
        console.log('getin runAsync2');
        dhttp({
            url: 'http://www.baidu.com'
        }, function (err, res) {
            if(err){
                reject(err);
            }
            console.log('runAsync2 ok');
            resolve(res);
        });
    });
    return promise;
}


// runAsync1().then(res => {
//     console.log('res:', res);
//     // console.log('222');
// });

var p=new Promise(runAsync1,runAsync2);
p.then((res)=>{
    console.log('p res');
})

// runAsync1().then(res=>{
//     runAsync2(res).then(r=>{
//         console.log('r:ok');
//     })
// })



