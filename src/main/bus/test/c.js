//create file
const fs=require('fs');
const path=require('path');

var default_fp = path.join(__dirname, '../../../../data/');
var fp = path.join(__dirname, '../../../../data/account/');

console.log(fp);
console.log('创建目录:'+fp);
// fs.mkdir(fp,function(err){
//     if(err){
//         console.log('err:',err);
//         return;
//     }
//     console.log('创建成功');
// })
mkdirsSync(fp);
function mkdirsSync(dirname){
    if(fs.existsSync(dirname)){
        return true;
    }else{
        if(mkdirsSync(path.dirname(dirname))){
            fs.mkdirSync(dirname);
            return true;
        }
    }
}