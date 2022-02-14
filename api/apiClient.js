import { error } from "util";

var rw = require("./requestWrapper.js");

module.exports = {
    orderbook: async (coinPair, depth) =>{
        return await rw.get("/market/" + coinPair + "/book?depth=" + (depth ? depth : 7) ).then( r => r.json() );
    },

    myorders: async (coinPair) =>{
        return await rw.get("/order/" + coinPair + "/list").then( r => r.json() );
    },

    mytrades: async (coinPair) =>{
        return await rw.get("/order/" + coinPair + "/trades").then( r => r.json() );
    },

    price: async (coinPair) => {
        return await rw.get("/market/" + coinPair + "/price").then( r => r.json() );
    },

    quote: async (coinPair) => {
        return await rw.get("/market/" + coinPair + "/quote").then( r => r.json() );
    },

    trades: async (coinPair, depth) =>{
        return await rw.get("/market/" + coinPair + "/trades?depth=" + (depth ? depth : 50) ).then( r => r.json() );
    },

    details: async () => {
        return await rw.get("/market/details").then( r => r.json() );
    },

    withdraw: async (coin, amount, address) => {
        let username = rw.username();
        return await rw.post(`/account/${username}/withdraw/${coin}`, {
            withdrawAddress: address,
            amount: amount
        }).then( r => r.json() );
    },

    getDepositAddress: async (coin) => {
        let username = rw.username();
        return await rw.get(`/account/${username}/deposit/${coin}`).then( r => r.json() );
    },

    walletBalance: async (coin) => {
        let username = rw.username();
        return await rw.get(`/account/${username}/balance/${coin}`).then( r => r.json() );
    },
    
    ask: async (coinPair, price, amount) => {
        return await rw.post(`/order/${coinPair}/add`, {
            side: "ask",
            size: amount,
            price: price
        }).then( r => r.json() );
    },
    
    bid: async (coinPair, price, amount) => {
        return await rw.post(`/order/${coinPair}/add`, {
            side: "bid",
            size: amount,
            price: price
        }).then( r => r.json() );
    },
    
    cancel: async (coinPair, orderId) => {
        return await rw.post(`/order/${coinPair}/cancel`, {
            id: orderId
        }).then( r => r.json() );
    },

    register: async () => {
        let username = rw.username();
        let pubKey = rw.publicKey();
        return await rw.post('/account/register', {
            id: username,
            publicKey: pubKey
        }).then( r => r.json() );
    },
    
    setAPI: (testnet) => {
        rw.setAPI(testnet);
    }
};
