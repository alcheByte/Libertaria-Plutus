import { types, process, decorate } from "mobx-state-tree"
import { T, setLocale } from '../localize/localizer';
import { Colors, Sizes, Keys } from '../config';

export const initialUserSettings = {
    curNetwork: 'prod',
    curLocale: 'en',
}

export const UserSettings = types.model('UserSettings', {
    curNetwork: types.maybe(types.string),
    curLocale: types.maybe(types.string),
    selectedPair: types.maybe(types.string),
    selectedPairTest: types.maybe(types.string),
    lastInactiveTime: types.maybe(types.number),
})
.actions(self => ({
    isTestnet() { return self.curNetwork === 'staging'},
    setNetwork(network) { 
        self.curNetwork = network;
        console.log(`setNetwork: ${network}`);
    },
    setLocale(locale) {
        self.curLocale = locale;
        setLocale(locale);
        console.log(`setLocale: ${locale}`);
    },
    setInactive() {
        self.lastInactiveTime = (new Date()).valueOf();
    },
    setSelectedPair(pair) {
        if(self.isTestnet()) self.selectedPairTest = pair;
        else self.selectedPair = pair;
    },
    getSelectedPair() {
        if(self.isTestnet()) 
            return self.selectedPairTest;
        return self.selectedPair;
    }
}));
