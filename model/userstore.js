import { Store } from './store';
import { Options, initialOptions } from './options';
import { LockSettings, initialLockSettings } from './locksettings'
import { UserSettings, initialUserSettings } from './usersettings'

// userStore gets hydrated in from local (secure) storage, static (compile type) options and app state from API
const userStore = Store.create({
    options: Options.create(initialOptions),
    lockSettings: LockSettings.create(initialLockSettings),
    userSettings: UserSettings.create(initialUserSettings),
    market: null,
});

export { Store }
export default { userStore }
