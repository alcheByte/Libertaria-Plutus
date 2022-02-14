import { SecureStore } from 'expo';
import * as api from './apiClient';
import * as rw from './requestWrapper';
import { T } from '../localize/localizer';

const _storageKey = 'plutus-pk';

module.exports = {
    loadPK: async (testnet) => {
        try {
            var key =await SecureStore.getItemAsync(_storageKey);
            if(key != null)
            {
                rw.setUserAndKey(key, testnet);
                // console.log(`Using api pri key [${key}]`);
                return true;
            }
        } catch (ex) {
            console.log("ERROR GETTING KEY!")
            console.error(ex);
        }
        return false;
    },

    createAccount: async (testnet) => {
        console.log("User not found generating new key.");
        key = await rw.generateUserAndKey();
        console.log(`New keys created\nprivate[${key}]\npub[${rw.publicKey()}]`);
        try {
            await SecureStore.setItemAsync(_storageKey, key)
            rw.setUserAndKey(key, testnet);
            await api.register();
            return true;
        } catch(ex) {
            console.log("ERROR REGISTERING!")
            console.error(ex);
        }
        return false;
    },

    // throw on error
    validatePK: (key) => {
        if(key == null) throw({err: T('first_use.pk_err_empty')});
        if(key.length != 64) throw({err: T('first_use.pk_err_bad_key'), detail: T('first_use.pk_err_length')});
        var re = new RegExp('^[0-9a-f]+$');
        var ok = re.exec(key);
        if(!ok) throw({err: T('first_use.pk_err_bad_key'), detail: T('first_use.pk_err_bad_chars')});
    },

    importPK: async (key) => {
        module.exports.validatePK(key);
        // console.log(`Importing private key: ${key}`);
        try {
            await SecureStore.setItemAsync(_storageKey, key)
            rw.setUserAndKey(key, false);
            var res = await api.register();
            console.log(res);
            if(!res.ok && !res.err.indexOf("is already used") == -1)
                throw(res);
        } catch(ex) {
            console.log("ERROR REGISTERING!")
            console.error(ex);
            throw({err: ex.toString()})
        }
        return true;
    },

    exportPK: async () => {
        try {
            return await SecureStore.getItemAsync(_storageKey);
        } catch (ex) {
            console.log("ERROR GETTING KEY!")
            console.error(ex);
        }
        return null;
    },

    deletePK: async () => {
        try {
            return await SecureStore.deleteItemAsync(_storageKey);
        } catch (ex) {
            console.log("ERROR DELETING KEY!")
            console.error(ex);
        }
        return null;
    },
}    
