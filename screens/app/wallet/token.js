import React from 'react';
import { BarCodeScanner, Camera, Permissions } from 'expo';
import { StyleSheet, Text, TextInput, ScrollView, View, Button, TouchableOpacity, Clipboard, Alert, Modal, ActivityIndicator } from 'react-native';

import Loader from "../../../components/loader"

import { LibertariaIcon } from '../../../assets/LibertariaIcon';
import { Colors, Sizes } from '../../../config';
import { Styles, ConfirmStyles } from '../../../config/styles';

import * as api from '../../../api/apiClient';
import { T } from '../../../localize/localizer';

let places = 8;

const localStyle = StyleSheet.create({
    walletToken: {
        backgroundColor: Colors.headerBG,
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        borderRadius: Sizes.cardCornerRadius,
        margin: 8,
        marginTop: 4,
        marginBottom: 4,
        height: 100,
    },
    name: {
        flex: 0,
        color: Colors.headerFG,
        fontSize: 18,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 10,
        alignSelf: "flex-start"
    },
    amount: {
        flex: 0,
        color: Colors.bodyFG,
        fontSize: 16,
        textAlign: "right"
    },
    pending: {
        flex: 0,
        color: Colors.bodyFG,
        fontSize: 12,
        margin: 5,
        textAlign: "right"
    },
    trading: {
        flex: 0,
        color: Colors.buy,
        fontSize: 12,
        margin: 5,
        textAlign: "right"
    },
    buttonBox: {
        borderWidth: 0,
        borderColor: "black",
        borderLeftWidth: 1,
        flexDirection: "column",
        alignSelf: 'stretch'
    },
    button: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 10
    },
    lastButton: {
        borderWidth: 0,
        borderColor: "black",
        borderTopWidth: 1
    },
    inputSmall: {
        fontSize: 14,
        flex: 1,
        color: Colors.bodyFG,
        backgroundColor: Colors.bodyBG,
        textAlign: 'center',
        alignItems: 'center',
        height: 42,
        margin: 0,
        padding: 0,
    },
    input: {
        fontSize: 18,
        flex: 1,
        color: Colors.bodyFG,
        backgroundColor: Colors.bodyBG,
        textAlign: 'center',
        alignItems: 'center',
        height: 42,
        margin: 0,
        padding: 0,
    },
    row: {
        flex: 0,
        flexDirection: "row",
        padding: 3,
        margin: 1,
    },
    utilButton: {
        flex: 0,
        backgroundColor: Colors.bodyBG,
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
    },
    confirm: {
        color: Colors.buttonBG,
        textAlign: 'center',
        alignContent: 'center',
        margin: 10,
        fontSize: 20,
    }
})

export default class WalletToken extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            scanner: false,
            withdrawVisible: false, withdrawAddress: '', withdrawAmount: '', withdrawDetails: [], withdrawConfirm: '', withdrawValid: false, busyWithdraw: false
        }
    }

    cancelWithdraw = async () => {
        this.setState({withdrawVisible: false});
        await this.clearWithdraw();
    }

    onBarcodeRead = (e) => {
        if( e.type != Camera.Constants.BarCodeType.qr) return;

        var address = e.data;

        var iC = address.indexOf(":");
        if( iC !== -1 ) {
            var coin = address.substring(0, iC);
            var walletCoin = this.props.coin.name;
            console.log(`'${coin}' or '${walletCoin}'`);
            if(coin == walletCoin) {
                address = address.substring(iC + 1);
            }
            else {
                Alert.alert(
                    T('common.error'),
                    T('wallet.token.barcoderead_error', {coin: coin, walletCoin: walletCoin}))
                return;
            }
        }
        
        var iQ = address.indexOf("?");
        if( iQ !== -1) address = address.substring(0, iQ);

        this.setState({
            withdrawAddress: address,
            scanner: false
        }, () => this.confirmWithdraw(this.state.withdrawAmount));
    }

    cancelScanWithdraw = () => {
        this.setState({scanner: false});
    }

    scanWithdraw = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        // console.log(status);
        this.setState({
            hasCameraPermission: status === 'granted',
            scanner: true
        });
    }

    maxWithdraw = async () => {
        let fltPrice = parseFloat(this.props.coin.available);
        if (isNaN(fltPrice) || fltPrice <= 0.0) {
            this.setState({withdrawMessage: T('wallet.token.none_available', {coin: this.props.coin.coin})});
            return;
        }
        await this.confirmWithdraw(this.props.coin.available);
    }

    confirmWithdraw = async ( amount ) => {
        let fAmount = parseFloat(amount);
        let errors = [];
        if(isNaN(fAmount) || fAmount <= 0.0)
            errors.push(T('common.positive', {edit_field: T('wallet.token.placeholder_withdraw_amount')}));
        let address = this.state.withdrawAddress;
        if (address.length == 0)
            errors.push(T('wallet.token.placeholder_withdraw_address', {coin: this.props.coin.coin}));
        if(errors.length > 0) {
            this.setState({
                withdrawMessage: errors.join('\n'),
                withdrawValid: false
            });
            return;
        }
        let fFee = parseFloat(this.props.coin.fee);
        let fTotal = fAmount - fFee;
        amount = fAmount.toPrecision(places);
        let total = fTotal.toPrecision(places);
        let fee = fFee.toPrecision(places);
        let details = [];
        details.push(`${T('common.amount')}: ${amount}`,
                     `${T('common.fee')}: ${fee}`,
                     `${T('common.total')}: ${total}`);
        let confirm = T('wallet.token.withdraw_confirm', {amount: total, address: address});
        this.setState({
            withdrawConfirm: confirm,
            withdrawDetails: details,
            withdrawAmount: amount,
            withdrawValid: true
        });
    }

    submitWithdraw = async () => {
        try {
            this.setState({busyWithdraw: true}, async () => {
                let result = await api.withdraw(this.props.coin.coin, this.state.withdrawAmount, this.state.withdrawAddress);
                console.log(result);
                if(result.err){
                    var errDetails = this.props.withdrawDetails.slice(0);
                    errDetails.push(result.err);
                    console.log(errDetails);
                    this.setState({busyWithdraw: false}, async () => {
                        await Alert.alert(T('common.error'), result.err);
                    });
                }
                else {
                    await Alert.alert(T('wallet.token.withdraw_success'));
                    this.clearWithdraw();
                }
            });
        } catch (ex) {
            this.setState({busyWithdraw: false});
            console.log(ex);
        }
    }

    clearWithdraw = async () => {
        this.setState({
            withdrawAddress: '',
            withdrawAmount: '',
            withdrawConfirm: '',
            withdrawDetail: '',
            withdrawVisible: false,
            withdrawValid: false,
            busyWithdraw: false
        });
    }

    deposit = async () => {
        var address = null;
        let result = await api.getDepositAddress(this.props.coin.coin);
        if(result.err) {
            await Alert.alert(T('common.error'), result.err);
            return;
        }
        address = result.depositAddress;
        if( !address || address == "0" /*Discord bot checks this?*/ ) {
            Alert.alert(
                T('wallet.token.deposit_alert', {coin : this.props.coin.name}),
                T('wallet.token.deposit_address_not_ready'));
        }  else {
            Clipboard.setString(address);
            Alert.alert(
                T('wallet.token.deposit_alert', {coin : this.props.coin.name}),
                T('wallet.token.deposit_clipboard', {address: address})
            );
        }
    }

    render() {
        const name = this.props.coin.name;
        const ticker = this.props.coin.coin;
        var title = name.substring(0, 1).toUpperCase() + name.substring(1);
        const fPending = parseFloat(this.props.coin.pending);
        const fInTrades = parseFloat(this.props.coin.balance) - parseFloat(this.props.coin.available);
        // console.log(this.props.coin);
        return (
            <View style={localStyle.walletToken}>
                <View style={{flexDirection: 'column', justifyContent: 'flex-start', marginRight: 10}}>
                    <Text style={localStyle.name}>{title}</Text>
                    <Text style={localStyle.name}>({ticker})</Text>
                </View>
                <View style={{flexDirection: 'column', flexGrow: 1, marginRight: 10}}>
                    { fInTrades > 0 ? <Text style={localStyle.trading}>({fInTrades})</Text> : null }
                    <Text style={localStyle.amount}>{this.props.coin.available}</Text>
                    { fPending > 0 ? <Text style={localStyle.pending}>[{fPending}]</Text> : null }
                </View>
                <View style={localStyle.buttonBox}>
                    <TouchableOpacity onPress={() => this.setState({withdrawVisible: true})} style={localStyle.button}>
                        <LibertariaIcon name="minus" size={Sizes.navIcon} color={Colors.buttonBG}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.deposit} style={[localStyle.button, localStyle.lastButton]}>
                        <LibertariaIcon name="plus" size={Sizes.navIcon} color={Colors.buttonBG}/>
                    </TouchableOpacity>
                </View>
                {/* Scanner */}
                <Modal animationType={"slide"} transparent={true}
                        visible={this.state.scanner} onRequestClose={() => { }}>
                    <View style={ConfirmStyles.modal}>
                        <BarCodeScanner style={{flex: 1, marginBottom: 10}}
                            onBarCodeRead={this.onBarcodeRead}
                            barCodeTypes={[Camera.Constants.BarCodeType.qr]}
                        />
                        <View style={localStyle.row}>
                            <TouchableOpacity onPress={this.cancelScanWithdraw} style={ConfirmStyles.buttonCancel}>
                                <Text style={ConfirmStyles.buttonText}>{T('common.cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                {/* Withdraw */}
                <Modal visible={this.state.withdrawVisible}
                       onRequestClose={() => { }} animationType={"slide"} transparent={true}>
                    <Loader loading={this.state.busyWithdraw}/>
                    <View style={ConfirmStyles.modal}>
                        <View style={localStyle.row}>
                            <TouchableOpacity onPress={this.scanWithdraw} style={localStyle.utilButton}>
                                <LibertariaIcon name="qrcode" size={Sizes.navIcon} color={Colors.buttonBG}/>
                            </TouchableOpacity>
                            <TextInput value={this.state.withdrawAddress} placeholder={T('wallet.token.placeholder_withdraw_address', {coin: this.props.coin.coin})} 
                                style={localStyle.inputSmall}
                                placeholderTextColor={Colors.hintText} underlineColorAndroid='transparent' autoCapitalize='none'
                                onChangeText={(a) => this.setState({withdrawAddress: a})} onEndEditing={() => this.confirmWithdraw(this.state.withdrawAmount)} />
                        </View>
                        <View style={localStyle.row}>
                            <TouchableOpacity onPress={this.maxWithdraw} style={localStyle.utilButton}>
                                <LibertariaIcon name="max" size={Sizes.navIcon} color={Colors.buttonBG}/>
                            </TouchableOpacity>
                            <TextInput value={this.state.withdrawAmount} keyboardType='phone-pad' placeholder={T('wallet.token.placeholder_withdraw_amount')}
                                style={localStyle.input}
                                placeholderTextColor={Colors.hintText} underlineColorAndroid='transparent'
                                onChangeText={(a) => this.setState({withdrawAmount: a})} onEndEditing={() => this.confirmWithdraw(this.state.withdrawAmount)} />
                        </View>
                        <View style={{flex: 0, flexDirection: "column", padding: 5 }}>
                            { this.state.withdrawDetails.map((d) => (<Text key={d} style={{color: Colors.plutus, fontSize: 16, margin: 2}}>{d}</Text>)) }
                        </View>
                        <View style={{flex: 0, flexGrow: 1, justifyContent: 'center'}}>
                            <Text style={localStyle.confirm}>{this.state.withdrawConfirm}</Text>
                        </View>
                        <View style={localStyle.row}>
                            <TouchableOpacity onPress={this.cancelWithdraw} style={ConfirmStyles.buttonCancel}>
                                <Text style={ConfirmStyles.buttonText}>{T('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.submitWithdraw} style={ConfirmStyles.buttonConfirm} disabled={!this.state.withdrawValid}>
                                <Text style={ConfirmStyles.buttonText}>{T('common.withdraw')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}