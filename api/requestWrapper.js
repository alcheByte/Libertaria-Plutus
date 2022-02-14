var uuidv4 = require("uuid/v4");
var ec = new (require("elliptic").eddsa)("ed25519");

// const _Endpoint_Testnet = 'http://40.84.229.174:3000'; // dev server
//const _Endpoint_Testnet = 'http://35.196.92.242:3000'; // staging 1
const _Endpoint_Testnet = 'http://35.204.30.180:3000'; // staging 2 (dockerized)
const _Endpoint_Mainnet = 'https://exchange-api.libertaria.world'; // production

var _key;
var _username;
var _hostPath;

function transformUsername(username) {
    return `__expo${username}`;     
}

function stringToUint(string) {
    var charList = string.split(''),
        uintArray = [];
    for (var i = 0; i < charList.length; i++) {
        uintArray.push(charList[i].charCodeAt(0));
    }
    return new Uint8Array(uintArray);
}

//Expects an array or hexstring
function getSignature(data) {
    if(_key === undefined) return null;
    var dat = stringToUint(data);
    let sig = `${_username}#${_key.sign(dat).toHex()}`;
    return sig;
}

function parse(result) {
    try {
        return JSON.parse(result);
    } catch(e) {
        return result;
    }
}

function getPath(){
    return _hostPath;
}

function setPath(hostPath){
    _hostPath = hostPath;
}

module.exports = {
    transformUsername: transformUsername,
    
    headers: async () => {
        let timestamp = (new Date()).toUTCString();
        let signature = getSignature(timestamp);
        return { signature, timestamp };
    },
    
    get: async (endpoint) => {
        let timestamp = (new Date()).toUTCString();
        let signature = getSignature(timestamp);
        
        let result;
        try {
            result = await fetch(getPath() + endpoint, {
                method: "GET",
                headers: { signature, timestamp }
            });
        } catch(e) {
            if (endpoint.indexOf("/deposit") !== -1) {
                return {depositAddress: "0"};
            }
        }        

        return parse(result);
    },
    
    post: async (endpoint, body) => {
        if (!(body.id)) {
            body.id = uuidv4();
        }
        let load = JSON.stringify(body);
        let signature = getSignature(load);

        let result = await fetch(getPath() + endpoint, {
            method: "POST",
            simple: false,
            resolveWithFullResponse: true,
            headers: { signature, "Content-type": "application/json" },
            body: load
        });

        return parse(result);
    },

    setUserAndKey: (secret, testnet) => {
        _key = ec.keyFromSecret(secret);
        _username = transformUsername(array2str(_key.getPublic()));
        setPath(testnet ? _Endpoint_Testnet : _Endpoint_Mainnet);
    },

    generateUserAndKey: () => {
        return new Promise((res, rej) => {
            try {
                var array = new Uint8Array(32);
                for( var i = 0; i < 32; i++ ) {
                    array[i] = Math.ceil(Math.random() * 255);
                }
                let key = array2str(array);
                module.exports.setUserAndKey(key);
                res(key);
            } catch (ex) {
                console.log("Error Generating Key: " + ex);
                rej(ex);
            }
        });
    },

    username: () => {
        return _username;
    },

    publicKey: () => {
        return array2str(_key.pubBytes());
    },

    setAPI: (testnet) => {
        setPath(testnet ? _Endpoint_Testnet : _Endpoint_Mainnet);
    }
}

function array2str(uint8) {
    var res = "";
    for( var i = 0; i < uint8.length; i++) {
        res += ("0"+uint8[i].toString(16)).slice(-2);
    }
    return res;
}