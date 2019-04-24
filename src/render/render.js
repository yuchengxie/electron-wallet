const ipcRenderer = require('electron').ipcRenderer;

var filename = '';
var password = '';
var currentfn = '';

window.onload = function () {
    //init default wallet
    ipcRenderer.send('getwallets');

    var input_change_pwd = getElement('frame_wallet_change', 'input_change_pwd');
    var b_change = getElement('frame_wallet_change', 'b_change');
    var btn_wallet_change = getElement('frame_wallet_change', 'btn_wallet_change');

    ipcRenderer.on('replygetwallets', function (event, data) {
        var childs = b_change.children;
        // console.log('childs:', childs, childs.length);
        for (var i = childs.length - 1; i >= 0; i--) {
            b_change.removeChild(childs[i]);
        }
        for (var i = 0; i < data.length; i++) {
            var name = data[i].split('.')[0];
            var ele = document.createElement('option');
            ele.innerText = name;
            b_change.appendChild(ele);
        }
        currentfn = b_change.value;
    });

    b_change.onchange = function (e) {
        //输入钱包设置密码
        currentfn = e.target.value;
        console.log('changewallet e:', currentfn);
    }

    btn_wallet_change.onclick = function () {
        var currentpwd = input_change_pwd.value;
        console.log('filename:', currentfn);
        if (IsEmpty(currentfn)) {
            alert('filename can not be empty');
            return;
        }
        if (IsEmpty(currentpwd)) {
            alert('password can not be empty');
            return;
        }
        password = currentpwd;
        filename = currentfn;
        // ipcRenderer.send('changewallet', [filename, password]);
        ipcRenderer.send('changewallet', [password, filename]);
    }

    ipcRenderer.on('replychangewallet', function (event, data) {
        console.log('replychangewallet data:', data);
        if (data && data.length == 2) {
            if (data[0] == 'true') {
                alert('change success to wallet:' + data[1]);
            } else {
                alert('password error');
            }
        }
    })

    //wallet_create
    var btn_wallet_create = getElement('frame_wallet_create', 'btn_wallet_create');
    var phone = getElement('frame_wallet_create', 'phone');
    var pwd = getElement('frame_wallet_create', 'pwd');
    var create_wallet_name = getElement('frame_wallet_create', 'create_wallet_name');
    var addr_create = getElement('frame_wallet_create', 'addr_create');
    btn_wallet_create.onclick = function () {
        var v_phone = phone.value;
        var v_pwd = pwd.value;
        v_wallet_name = create_wallet_name.value;
        if (IsEmpty(v_pwd)) {
            alert('password can not be empty');
            return;
        };
        if (IsEmpty(v_wallet_name)) {
            alert('filename can not be empty');
            return;
        };
        var v_wallet_name = v_wallet_name + '.cfg';
        console.log("v_walletfilename:", v_wallet_name);
        ipcRenderer.send('create', [v_phone + v_pwd, v_pwd, v_wallet_name]);
    }

    ipcRenderer.on('replycreate', function (event, data) {
        if (data) {
            console.log('replycreate:', data, data.length);
            addr_create.innerText = data[1];
            alert(data[0] + '创建成功');
            //update wallets display
            ipcRenderer.send('getwallets');
        }
    })

    //wallet_import
    var btn_wallet_import = getElement('frame_wallet_import', 'btn_wallet_import');
    var addr_import = getElement('frame_wallet_import', 'addr_import');
    var p_import_pwd = getElement('frame_wallet_import', 'p_import_pwd');
    var import_prvk = getElement('frame_wallet_import', 'import_prvk');
    var import_wallet_name = getElement('frame_wallet_import', 'import_wallet_name');
    btn_wallet_import.onclick = function () {
        var pvk = import_prvk.value;
        var pwd = p_import_pwd.value;
        var wallet_name = import_wallet_name.value + '.cfg';
        if (IsEmpty(pvk)) {
            alert('pvk can not be empty');
            return;
        };
        if (IsEmpty(pwd)) {
            alert('password can not be empty');
            return;
        };
        if (IsEmpty(wallet_name)) {
            alert('filename can not be empty');
            return;
        };
        ipcRenderer.send('save', [pvk, pwd, wallet_name]);
    }

    ipcRenderer.on('replysave', function (event, data) {
        if (data) {
            addr_import.innerText = data[0];
            alert(data[1] + '钱包导入成功');
        }
    })

    //wallet_info
    var btn_wallet_info = getElement('frame_wallet_info', 'btn_wallet_info');
    var info_address = getElement('frame_wallet_info', 'info_address');
    btn_wallet_info.onclick = function () {
        var address = info_address.value.trim();
        console.log('address:', address);
        if (address.length != 0 && address.length != 54) {
            //todo
            alert('address invalid');
            return;
        }
        ipcRenderer.send('info', address);
    }

    var infocard = getElement('frame_wallet_info', 'infocard');
    var infocontent = getElement('frame_wallet_info', 'infocontent');
    ipcRenderer.on('replyinfo', function (event, data) {
        if (data) {
            var d = {};
            d.account = data.account;
            d.total = data.total;
            d.link_no = data.link_no;
            d.search = data.search;
            d.timestamp = data.timestamp;
            d.found=data.found;
            infocard.style.display = 'block';
            var s = JSON.stringify(d, "", "\t");
            infocontent.innerText = s;
        }
    })

    //block
    var block_hash = getElement('frame_block', 'block_hash');
    var block_height = getElement('frame_block', 'block_height');
    var blockcard = getElement('frame_block', 'blockcard');
    var blockcontent = getElement('frame_block', 'blockcontent');
    var btn_block = getElement('frame_block', 'btn_block');
    btn_block.onclick = function () {
        var hash = block_hash.value;
        var height = block_height.value;
        console.log('>> hash:', hash);
        console.log('>> height:', height);
        if (!IsEmpty(hash) && hash.length != 64) {
            alert('hash length must be 64');
            return;
        }
        if (!IsEmpty(height) && !IsInteger(height)) {
            alert('height err');
            return;
        }
        ipcRenderer.send('block', [hash, height]);
    }

    ipcRenderer.on('replyblock', function (event, data) {
        console.log(data);
        if (data) {
            blockcard.style.display = 'block';
            // var s = JSON.stringify(data, null, "\t");
            var s = JSON.stringify(data, null, 4);
            blockcontent.innerText = s;
        }
    })

    //utxo
    var btn_utxo = getElement('frame_utxo', 'btn_utxo');
    var utxocard = getElement('frame_utxo', 'utxocard');
    var utxocontent = getElement('frame_utxo', 'utxocontent');
    btn_utxo.onclick = function () {
        ipcRenderer.send('utxo', 'utxo查询');
    }
    ipcRenderer.on('replyutxo', function (event, data) {
        console.log(data);
        if (data) {
            utxocard.style.display='block';
            var s = JSON.stringify(data, null, "\t");
            console.log(s);
            //demo
            utxocontent.innerText = s;
        }
    })

    //交易
    var addrfrom = getElement('frame_transfer', 'addrfrom');
    var addrto = getElement('frame_transfer', 'addrto');
    var t_value = getElement('frame_transfer', 't_value');
    var btn_txns = getElement('frame_transfer', 'btn_txns');
    // var btn_utxo = getElement('frame_utxo', 'btn_utxo');
    btn_txns.onclick = function () {
        var from = addrfrom.value;
        var to = addrto.value;
        var value = t_value.value;
        console.log('btn_txns');
        ipcRenderer.send('transfer', [from, to, value]);
    }

}

function getElement(frameId, eleId) {
    var ele = document.getElementById(frameId).contentWindow.document.getElementById(eleId);
    return ele;
}

function IsInteger(str) {
    str = str.trim();
    var reg = new RegExp('^[0-9]*$');
    if (reg.test(str)) {
        return true;
    }
    return false;
}

function IsEmpty(obj) {
    if (typeof obj == "undefined" || obj == null || obj == "") {
        return true;
    } else {
        return false;
    }
}
