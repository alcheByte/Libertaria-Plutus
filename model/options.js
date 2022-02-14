import { types, process, decorate } from "mobx-state-tree"

import { T, SupportedLocales, getLocale, setLocale } from '../localize/localizer';

export const Locale = types.model('Locale', {
    value: types.identifier(types.string),
    label: types.string,
})

export const Network = types.model('Network', {
    value: types.identifier(types.string),
    label: types.string,
})

const _SupportedLocales = SupportedLocales.map( loc => Locale.create({label: loc.lang, value: loc.code}));
const _Networks = [
        {label: T('settings.net_prod'),    value: 'prod'},
        {label: T('settings.net_staging'), value: 'staging'}
    ].map( n => Network.create(n));

export const initialOptions = {
    supportedLocales: _SupportedLocales,
    networks: _Networks,
}

export const Options = types.model('Options', {
    supportedLocales: types.array(Locale),
    networks: types.array(Network),
})