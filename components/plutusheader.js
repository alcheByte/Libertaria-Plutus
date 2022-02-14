import Expo from 'expo';
import React from 'react';
import { inject, observer } from 'mobx-react/native';
import { Text, View, Image, StatusBar, TouchableOpacity, AsyncStorage, Platform } from 'react-native';
import { Select, Option } from "react-native-chooser";
import { Header, Left, Right, Body, Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Persist from '../utility/persist'

import { LibertariaIcon } from '../assets/LibertariaIcon';
import { T } from '../localize/localizer';
import * as api from '../api/apiClient';

import { Colors, Sizes, Keys } from '../config';
import { Styles } from '../config/styles';

@inject('userStore') @observer
export class PlutusHeader extends React.Component {

    onSelectedPairChange = async (val) => {
        var userSettings = this.props.userStore.userSettings;
        userSettings.setSelectedPair(val, userSettings.isTestnet());
        var userSettings = JSON.stringify(this.props.userStore.userSettings);
        console.log(`onSelectedPairChange >> userSettings: ${userSettings}`);
        await AsyncStorage.setItem(Keys.Settings, userSettings);
    }

    render() {
        var market = this.props.userStore.market;
        return (
            <Header noLeft style={{borderBottomWidth: 0, paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight :  StatusBar.currentHeight + 10}}>
                <Body style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={() => Actions.push('support')}>
                        <View style={{flexDirection: 'row'}}>
                            <Image source={require('../assets/plutus-icon.png')} resizeMode='contain' style={{height: 32, width: 32}}/>
                            <Text style={{fontFamily: 'plutus', fontSize: 24, color: Colors.plutus, alignSelf: 'center', paddingLeft: 5}}>PLUTUS</Text>
                        </View>
                    </TouchableOpacity>
                { (this.props.navigation.state.index > 1) ? <View/> :
                        <Select style={{backgroundColor: Colors.headerBG, alignItems: 'center', borderWidth: 0, marginRight: 5}}
                                defaultText={market.curCoinPair.name}
                                selected={market.curCoinPair.name}
                                textStyle={{color: Colors.action, fontSize: 16, textAlign: 'right'}}
                                backdropStyle={{backgroundColor: Colors.bodyBG}}
                                optionListStyle={{backgroundColor: Colors.bodyBG, padding: 10, marginTop: 30, marginBottom: 30, alignItems: 'center', borderWidth: 0}}
                                onSelect={(val, lbl) => this.onSelectedPairChange(val)}>
                        { market.coinpairs.map( p => 
                            <Option value={p.name} key={p.name} styleText={{color: Colors.action, fontSize: 19}}>{p.name}</Option>
                        )}
                        </Select>
                }
                </Body>
                <Right>
                    <TouchableOpacity onPress={() => Actions.push('settings')} style={{alignSelf: 'center'}}>
                        <LibertariaIcon name="settings" size={Sizes.navIcon} color={Colors.buttonBG}  style={{alignSelf: 'center', paddingRight: 10}}/>
                    </TouchableOpacity>
                </Right>
            </Header>
        );
    }
}