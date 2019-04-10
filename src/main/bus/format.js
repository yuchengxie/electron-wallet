var txns = {
    getFmt: function () {
        return 'txn[]';
    }
}


var txn = {
    getFmt: function () {
        return [
            ['version', 'I'],
            ['tx_in', 'txn_in[]'],
            ['tx_out', 'txn_out[]'],
            ['lock_time', 'I'],
            ['sig_raw', varstr],
        ];
    }
}

var outpoint={
    getFmt: function () {
        return [
            ['hash', 'B[32]'],
            ['index', 'I'],
        ]
    }
}

var txn_in = {
    getFmt: function () {
        return [
            ['prev_output', 'outpoint[]'],
            ['sig_script', varstr],
            ['sequence', 'I'],
        ]
    }
}

var txn_out = {
    getFmt: function () {
        return [
            ['value', 'q'],
            ['pk_script', varstr],
        ]
    }
}

var varstr = {
    getFmt: function () {
        return 'VS[]';
    }
}

var str = (n) => {
    return 'S[' + n + ']';
}

var found = {
    getFmt: function () {
        return [
            ['uock', 'q'],
            ['value', 'q'],
            ['height', 'I'],
        ]
    }
}

var founds = {
    getFmt: function () {
        return 'found[]';
    }
}

var info = {
    getFmt: function () {
        return [
            ['link_no', 'I'],
            ['timestamp', 'I'],
            ['account', varstr],
            ['search', 'I'],
            ['found', founds],
        ];
    }
}

var utxo = {
    getFmt: function () {
        return [
            ['link_no', 'I'],
            ['heights', 'I[]'],
            ['indexes', 'I[]'],
            ['txns', 'txn[]'],
        ];
    }
}

var gFormat = {
    // 'I': null,
    // 'txns': txns,
    // 'txn': txn,
    'VS': varstr,
    // 'S': str(3),
    
    'txn':txn,
    'txn_in':txn_in,
    'txn_out':txn_out,
    'outpoint':outpoint,
    'utxo': utxo,

    'found': found,
    'founds': founds,
    'info': info,
    
}

module.exports = gFormat;
