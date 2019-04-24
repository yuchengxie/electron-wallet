const chinaTime = require('china-time');
console.log(chinaTime('YYYY-MM-DD HH:mm:ss')); // 2018-02-07 13:08:17


function runAsync1() {
	var promise = new Promise(function (resolve, reject) {
		setTimeout(function () {
			console.log('异步1完成');
			resolve('xxx1');
		}, 1000);
	});
	return promise;
}

function runAsync2() {
	var promise = new Promise(function (resolve, reject) {
		setTimeout(function () {
			console.log('异步2完成');
			resolve('xxx2');
		}, 2000);
	});
	return promise;
}

function runAsync3() {
	var promise = new Promise(function (resolve, reject) {
		setTimeout(function () {
			console.log('异步3完成');
			resolve('xxx3');
		}, 2000);
	});
	return promise;
}

// runAsync1()
// 	.then(function (data) {
// 		console.log('runAsync1 拿到数据:', data);
// 		return runAsync2();
// 	})
// 	.then(function (data) {
// 		console.log('runAsync2 拿到数据:', data);
// 		return runAsync3();
// 	})
// 	.then(function (data) {
// 		console.log('runAsync3 拿到数据:', data);
// 	});
// runAsync1();
// runAsync2();
// runAsync3();


//不是顺序执行
// runAsync1().then(res => {
// 	console.log('res1');
// });
// runAsync2().then(res => {
// 	console.log('res2');
// });
// runAsync3().then(res => {
// 	console.log('res3');
// });
