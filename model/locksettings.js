import { types, process, decorate } from "mobx-state-tree"
import { T, SupportedLocales, getLocale, setLocale } from '../localize/localizer';

export const initialLockSettings = {
    option: 'none',
    schedule: 'onstart',
    lockAfterMinutes: 5,
}

export const LoginOptions = [ // "Biometric" not working on Expo right now :(
    {
        value: "none",
        display: T('settings.lock_option_none'),
    },
    {
        value: "pin",
        display: T('settings.lock_option_pin'),
    },
    {
        value: "password",
        display: T('settings.lock_option_password'),
    },
]

export const LockSchedules = [
    {
        value: "onstart",
        display: T('settings.lock_sched_onstart'),
    },
    {
        value: "onactivate",
        display: T('settings.lock_sched_onactivate'),
    },
    {
        value: "inactiveFor",
        display: T('settings.lock_sched_inactiveFor'),
    },
]

export const LockSettings = types.model('LockSettings', {
    option: types.enumeration("Lock option", LoginOptions.map(s => s.value)),
    PIN: types.maybe(types.string),
    password: types.maybe(types.string),
    schedule: types.enumeration("Lock schedule", LockSchedules.map(s => s.value)),
    lockAfterMinutes: types.maybe(types.number),
})

