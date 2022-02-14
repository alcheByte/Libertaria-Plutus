import { types, destroy, decorate } from "mobx-state-tree"

import { T } from '../localize/localizer';
import { Keys } from '../config';

import { Market, newMarket } from './market'
import { Options } from './options'
import { LockSettings } from './locksettings'
import { UserSettings } from './usersettings'

// console.log(Options);

export const Store = types.model('Store', {
    options:     types.maybe(Options),
    lockSettings: types.maybe(LockSettings),
    userSettings: types.maybe(UserSettings),
    market:      types.maybe(Market),
})
.actions(self => ({
    setLockSettings(settings) { self.lockSettings = settings },
    setUserSettings(settings) { self.userSettings = settings },
    loadMarket(details) { self.market = newMarket(details, self.userSettings.getSelectedPair()) },
}));

export default Store;