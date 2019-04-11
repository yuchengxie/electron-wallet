var txns = {
    getFmt: function () {
        return 'txn[]';
    }
}

var txn = {
    getFmt: function () {
        return [
            ['version', 'I'],
            ['tx_in',tx_ins],
            ['tx_out', tx_outs],
            ['lock_time', 'I'],
            ['sig_raw', varstr],
        ];
    }
}

var tx_outs = {
    getFmt: function () {
        return 'tx_out[]';
    }
}

var tx_out={
    getFmt: function () {
        return [
            ['value', 'q'],
            ['pk_script', varstr],
        ]
    }
}

var tx_ins={
    getFmt: function () {
        return 'tx_in[]';
    }
}

var tx_in = {
    getFmt: function () {
        return [
            ['prev_output', outpoint],
            ['sig_script', varstr],
            ['sequence', 'I'],
        ]
    }
}

var outpoint = {
    getFmt: function () {
        return [
            ['hash', byte(32)],
            ['index', 'I'],
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

var byte = (n) => {
    return 'B[' + n + ']';
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
            ['txns', txns],
        ];
    }
}

var gFormat = {
    // 'I': null,
    'VS': varstr,

    'txn': txn,
    'tx_in':tx_in,
    'tx_out':tx_out,
    'outpoint': outpoint,
    'utxo': utxo,

    'found': found,
    'founds': founds,
    'info': info,

    // 'block':
    
}

module.exports = gFormat;
