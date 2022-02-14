import { types, process, decorate } from "mobx-state-tree"

import { T } from '../localize/localizer';

export const Coin = types.model('Coin', {
    coin: types.identifier(types.string),
    name: types.string,
    fee: types.string,
    maxConfirmationSeconds: types.number,
})

export const CoinPair = types.model('CoinPair', {
    base: types.reference(types.late(() => Coin)),
    trade: types.reference(types.late(() => Coin)),
    name: types.identifier(types.string),
})

export const Market = types.model('Market', {
    coins: types.array(Coin),
    coinpairs: types.array(CoinPair),
    curCoinPair: types.reference(types.late(() => CoinPair)),
})
.actions(self => ({
    setCoinPair(coinpair) { self.curCoinPair = coinpair; console.log(`setCoinPair: ${name}`); },
}));

export function newMarket(details, selectedPair) {
    var coins = details.coins.map(c => Coin.create({name: c.name, coin: c.coin, fee: c.fee, maxConfirmationSeconds: c.maxConfirmationSeconds}));
    var coinpairs = details.coinpairs.map(cp => {
        var pair = cp.split('-');
        var base = coins.find(c => c.coin == pair[1]);
        var trade = coins.find(c => c.coin == pair[0])
        return CoinPair.create({name: cp, base: base, trade: trade})
    });
    var curPair = (selectedPair ? coinpairs.find(p => p.name === selectedPair) : coinpairs[0]) || coinpairs[0];
    return Market.create({coins, coinpairs, curCoinPair: curPair});
}