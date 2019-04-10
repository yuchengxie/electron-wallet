const ipcRenderer = require('electron').ipcRenderer;

window.onload = function () {
    //wallet_create
    var btn_wallet_create = getElement('frame_wallet_create', 'btn_wallet_create');
    var phone = getElement('frame_wallet_create', 'phone');
    var pwd = getElement('frame_wallet_create', 'pwd');
    var addr = getElement('frame_wallet_create', 'addr');
    btn_wallet_create.onclick = function () {
        var v = phone.value + pwd.value;
        console.log('phone v:', v, v.length);
        ipcRenderer.send('create', v);
    }

    ipcRenderer.on('replycreate', function (event, data) {
        if (data) {
            console.log('replycreate:', data, data.length);
            addr.innerText = data;
        }
    })

    //wallet_import
    var btn_wallet_import = getElement('frame_wallet_import', 'btn_wallet_import');
    btn_wallet_import.onclick = function () {
        ipcRenderer.send('save', '4dabbaf739e4dfec415fea38f1efdbb67a0786746db3d1063b2339a44fb13458');
    }

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
        block_list.style.display='block';
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

    var btn_utxo=getElement('frame_utxo','btn_utxo');
    btn_utxo.onclick=function(){
        ipcRenderer.send('utxo','utxo查询');
    }
    ipcRenderer.on('replyutxo',function(event,data){
        console.log(data);
    })


    var addrfrom=getElement('frame_transfer','addrfrom')
    var addrto=getElement('frame_transfer','addrto')
    var t_value=getElement('frame_transfer','t_value')
    var btn_txns=getElement('frame_transfer','btn_txns')
    btn_txns.onclick=function(){
        // var from=addrfrom.value;
        // var to=addrfrom.value;
        // var value=t_value.value;
        // console.log('btn_txns');
        // ipcRenderer.send('transfer')
    }
    
}


function getElement(frameId, eleId) {
    var ele = document.getElementById(frameId).contentWindow.document.getElementById(eleId);
    return ele;
}