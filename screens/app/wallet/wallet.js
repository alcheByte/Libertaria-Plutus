import React from 'react';
import { observer, inject } from 'mobx-react'
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity, Alert, AsyncStorage, Clipboard } from 'react-native';
import { Container } from 'native-base';

import { Colors, Sizes } from '../../../config';
import { Styles, ConfirmStyles } from '../../../config/styles';

import api from "../../../api/apiClient";
import auth from "../../../api/auth";
import { T } from '../../../localize/localizer';

import { PlutusHeader } from '../../../components/plutusheader'

import WalletToken from './token';

@inject('userStore') @observer
export default class Wallet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            balances: null,
            apiError: null,
            refreshing: false,
        }
    }

    componentDidMount() {
        this._onRefresh();
    }
    
    _onRefresh = async () => {
        this.setState({
            refreshing: true
        }, this.refreshAll);
    }

    refreshAll = async () => {
        try {
            let tradeableCoins = this.props.userStore.market.coins.filter(c => this.props.userStore.market.coinpairs.some(p=> p.base === c || p.trade == c));
            //console.log('tradeableCoins: ' + tradeableCoins);
            let balances = await Promise.all( tradeableCoins.map( async (c) => {
                let res = await api.walletBalance(c.coin);
                return {...c, ...res};
            }));
            this.setState({balances, apiError: null, refreshing: false});
        } catch (err) {
            console.log(err.message);
            this.setState({apiError: err.message});
        }        
    }

    exportKey = async () => {
        try {
            var key = await auth.exportPK();
            Clipboard.setString(key);
            Alert.alert(T('wallet.exported', {key: key}));
        } catch (ex) {
            console.log(ex);
            Alert.alert('Error exporting PK', ex.toString());
        }
    }

    render() {
        // console.log(this.state.apiError);
        return (
            <Container>
                <PlutusHeader {...this.props}/>
                <ScrollView contentContainerStyle={Styles.container} style={{backgroundColor: Colors.bodyBG}}
                            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)}
                                                            style={{backgroundColor: Colors.bodyBG}}
                                                            tintColor={Colors.select} colors={['#0F72CC']} progressBackgroundColor={Colors.bodyBG}
                                                            title=''/>}>
                    {   this.state.apiError !== null || this.state.balances === null ? 
                            <View style={localStyles.fill}>
                                <Text style={localStyles.error}>{this.state.apiError}</Text>
                            </View> :
                        this.state.balances.map( b => (
                            <WalletToken coin={b} key={b.coin} />
                    ))}
                    <View style={localStyles.fill}>
                        <Text style={localStyles.link} onPress={this.exportKey}>{T('wallet.export')}</Text>
                    </View>
                </ScrollView>
            </Container>
        );
    }
}
  
const localStyles = StyleSheet.create({
    page: {
        flexDirection: "column",
        flex: 1,
        alignContent: 'flex-start',
        backgroundColor: Colors.bodyBG,
    },
    fill: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    error: {
        color: Colors.errorBG,
        fontSize: 16,
        justifyContent: 'center',
    },
    link: {
        flex: 0,
        flexDirection: 'column',
        color: Colors.buttonBG,
        textAlign: 'center',
        alignContent: 'flex-end',
        margin: 5,
        padding: 16,
        fontSize: 20,
        textDecorationLine: 'underline',
    },
});

