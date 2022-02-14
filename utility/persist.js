import { AsyncStorage } from 'react-native';

module.exports = {
    get: async (key, isTest) => {
        if(isTest === true) key = key + '.test';
        return await AsyncStorage.getItem(key);
    },
    set: async (key, newVal, isTest) => {
        if(isTest === true) key = key + '.test';
       return AsyncStorage.setItem(key, newVal);
    }
};