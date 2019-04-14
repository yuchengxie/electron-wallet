const ipcRenderer = require('electron').ipcRenderer;

var filename;
var password;

window.onload = function () {
    //init default wallet
    ipcRenderer.send('getwallets');

    var input_change_pwd = getElement('frame_wallet_change', 'input_change_pwd');
    var b_change = getElement('frame_wallet_change', 'b_change');
    var wallet_name = getElement('frame_wallet_change', 'wallet_name');
    var btn_wallet_change = getElement('frame_wallet_change', 'btn_wallet_change');

    // var childs = b_change.children;
    // console.log('hahha childs:',childs,childs.length);
    // console.log('childs[0] value:',childs[0]);
    // if (childs.length>=1){
    //     // console.log('hahha childs:',childs,childs.length);
    //     console.log('childs[0] value:',childs[0].value);
    // }
   

    ipcRenderer.on('replygetwallets', function (event, data) {
        var childs = b_change.children;
        console.log('childs:',childs,childs.length);
        for (var i = childs.length - 1; i >= 0; i--) {
            b_change.removeChild(childs[i]);
        }
        for (var i = 0; i < data.length; i++) {
            var name = data[i].split('.')[0];
            var ele = document.createElement('option');
            ele.innerText = name;
            //default
            if(i==0){
                filename=ele.innerText;
                console.log('>> filename',filename);
            }
            b_change.appendChild(ele);
        }
    });

    b_change.onchange = function (e) {
        //输入钱包设置密码
        filename = e.target.value;

        console.log('changewallet e:', filename);
        // wallet_name.innerText = filename;
    }

    btn_wallet_change.onclick = function () {
        // var filename = wallet_name.value;
        password = input_change_pwd.value;
        console.log('filename:', filename)
        if (isEmpty(filename)) {
            alert('filename can not be empty');
            return;
        }
        if (isEmpty(password)) {
            alert('password can not be empty');
            return;
        }
        ipcRenderer.send('changewallet', [filename, password]);
    }

    ipcRenderer.on('replychangewallet', function (event, data) {
        if (data && data.length == 2) {
            if (data[0] == true) {
                alert('change success to wallet:' + data[1]);
            } else {
                alert('password error');
            }
        }
    })

    function changewallet(e) {
        // e.prentDefault();
        // alert(e);
        //输入钱包设置密码
        //filename = e.target.innerText;

        //console.log('changewallet e:',filename);
        // wallet_name.innerText = filename;
    }


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
        if (isEmpty(v_pwd)) {
            alert('password can not be empty');
            return;
        };
        if (isEmpty(v_wallet_name)) {
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
        if (isEmpty(pvk)) {
            alert('pvk can not be empty');
            return;
        };
        if (isEmpty(pwd)) {
            alert('password can not be empty');
            return;
        };
        if (isEmpty(wallet_name)) {
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
    btn_wallet_info.onclick = function () {
        ipcRenderer.send('info', 'this is info');
    }

    var info_list = getElement('frame_wallet_info', 'info_list');
    var link_no = getElement('frame_wallet_info', 'link_no');
    var timestamp = getElement('frame_wallet_info', 'timestamp');
    var account = getElement('frame_wallet_info', 'account');
    var search = getElement('frame_wallet_info', 'search');
    var found_uock = getElement('frame_wallet_info', 'found_uock');
    var found_value = getElement('frame_wallet_info', 'found_value');
    var found_height = getElement('frame_wallet_info', 'found_height');
    ipcRenderer.on('replyinfo', function (event, data) {
        if (data) {
            console.log(data);
            info_list.style.display = 'block';
            link_no.innerText = 'link_no:' + data.link_no;
            timestamp.innerText = 'timestamp:' + data.timestamp;
            account.innerText = 'account:' + data.account;
            search.innerText = 'search:' + data.search;
            found_uock.innerText = 'found_uock:' + data.found[0].uock;
            found_value.innerText = 'found_value:' + data.found[0].value;
            found_height.innerText = 'found_height:' + data.found[0].height;
        }
    })

    //block
    var btn_block = getElement('frame_block', 'btn_block');
    btn_block.onclick = function () {
        ipcRenderer.send('block', '区块查询');
    }

    var block_list = getElement('frame_block', 'block_list');
    var b_link_no = getElement('frame_block', 'link_no');
    var heights = getElement('frame_block', 'heights');
    var txcks = getElement('frame_block', 'txcks');
    var version = getElement('frame_block', 'version');
    var prev_block = getElement('frame_block', 'prev_block');
    var b_timestamp = getElement('frame_block', 'timestamp');
    var bits = getElement('frame_block', 'bits');
    var nonce = getElement('frame_block', 'nonce');
    var miner = getElement('frame_block', 'miner');
    var txn_count = getElement('frame_block', 'txn_count');
    ipcRenderer.on('replyblock', function (event, data) {
        console.log(data);
        block_list.style.display = 'block';
        b_link_no.innerText = 'link_no:' + data.link_no;
        heights.innerText = 'heights:' + data.heights[0];
        txcks.innerText = 'txcks:' + data.txcks[0];
        version.innerText = 'version:' + data.headers[0].version;
        prev_block.innerText = 'prev_block:' + data.headers[0].prev_block;
        b_timestamp.innerText = 'timestamp:' + data.headers[0].timestamp;
        bits.innerText = 'bits:' + data.headers[0].bits;
        nonce.innerText = 'nonce:' + data.headers[0].nonce;
        miner.innerText = 'miner:' + data.headers[0].miner;
        txn_count.innerText = 'txn_count:' + data.headers[0].txn_count;
    })

    //utxo
    var btn_utxo = getElement('frame_utxo', 'btn_utxo');
    var utxo_list = getElement('frame_utxo', 'utxo_list');
    btn_utxo.onclick = function () {
        ipcRenderer.send('utxo', 'utxo查询');
    }
    ipcRenderer.on('replyutxo', function (event, data) {
        console.log(data);
        if (data) {
            //demo
            for (var i = 0; i < 3; i++) {
                var ele = document.createElement('li');
                ele.className = 'list-group-item';
                ele.id = 'list_' + i;
                ele.innerText = '111';
                utxo_list.appendChild(ele);
            }
        }
    })

    //交易
    var addrfrom = getElement('frame_transfer', 'addrfrom');
    var addrto = getElement('frame_transfer', 'addrto');
    var t_value = getElement('frame_transfer', 't_value');
    var btn_txns = getElement('frame_transfer', 'btn_txns');
    // var btn_utxo = getElement('frame_utxo', 'btn_utxo');
    console.log('btn_txns:', btn_txns);
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

function isEmpty(obj) {
    if (typeof obj == "undefined" || obj == null || obj == "") {
        return true;
    } else {
        return false;
    }
}

