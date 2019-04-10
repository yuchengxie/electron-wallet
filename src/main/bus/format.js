var txns = {
    getFmt: function () {
        return 'txn[]';
    }
}


var txn = {
    getFmt: function () {
        return [
            ['value', 'I'],
            ['pk_script', str(2)]
        ];
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
            ['heights', '[]'],
            ['indexes', varstr],
            ['txns', 'I'],
        ];
    }
}

var gFormat = {
    'I': null,
    'txns': txns,
    'txn': txn,
    'VS': varstr,
    'S': str(3),

    'found': found,
    'founds': founds,
    'info': info,
    'utxo': utxo,
}

module.exports=gFormat;
