import React from 'react';
import { observer, inject } from 'mobx-react'
import { ScrollView, Text, TextInput, View, Button, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { MenuContext, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import { LibertariaIcon } from '../../../assets/LibertariaIcon';

import { Colors, Sizes } from '../../../config';
import { Styles, ConfirmStyles } from '../../../config/styles';

import * as api from "../../../api/apiClient";
import { T } from '../../../localize/localizer';

let places = 8;

@inject('userStore') @observer
export default class Ask extends React.Component {
    constructor(props) {
        super(props);
        let pair = this.props.userStore.market.curCoinPair;
        this.state = {
            confirmAsk: false,
            askUnits: '', askPrice: '', askTotal: '',
            orderDetails: [],
            askValid: false,
            askError: '',
            confirmAskMessage: '',
            placeholder: (0).toPrecision(places),
            balanceTrade: null, balanceBase: null,
            baseCoin: pair.base.coin,
            tradeCoin: pair.trade.coin,
            selectedPair: pair.name,
        }
    }

    async componentDidMount() {
        await this.updateAll();
    }

    updateAll = async () => {
        let balBase = await api.walletBalance(this.state.baseCoin);
        let balTrade = await api.walletBalance(this.state.tradeCoin);

        console.log('balBase: ' + JSON.stringify(balBase));
        console.log('balTrade: ' + JSON.stringify(balTrade));

        this.setState({
            balanceBase: balBase,
            balanceTrade: balTrade,
        });
    }

    cancelAsk = () => {
        this.setState({confirmAsk: false});
    }

    onAsk = () => {
        let fAmount = parseFloat(this.state.askTotal);
        let fFee = fAmount * 0.005; // TODO get fee from API (details)
        let fTotal = fAmount - fFee;
        let subtotal = fAmount.toPrecision(places);
        let total = fTotal.toPrecision(places);
        let fee = fFee.toPrecision(places);
        details = [];
        details.push(`${T('common.price')}: ${this.state.askPrice} ${this.state.baseCoin}/${this.state.tradeCoin}`,
                     `${T('common.amount')}: ${this.state.askUnits} ${this.state.tradeCoin}`,
                     `${T('common.subtotal')}: ${subtotal} ${this.state.baseCoin}`,
                     `${T('common.fee')}: ${fee} ${this.state.baseCoin}`,
                     `${T('common.total')}: ${total} ${this.state.baseCoin}`);

        let confirmMsg = T('trade.sell.confirm', {
            units: this.state.askUnits,
            tradeCoin: this.state.tradeCoin,
            total: total,
            baseCoin: this.state.baseCoin
        });
        this.setState({
            confirmAskMessage: confirmMsg,
            orderDetails: details,
            confirmAsk: true
        });
    }

    sendAsk = async () => {
        try {
            let result = await api.ask(this.state.selectedPair, this.state.askPrice ,this.state.askUnits );
            if(result.err) {
                this.setState({
                    askError: result.err,
                });
                Alert.alert(T('common.error'), result.err);
            }
            else {
                Alert.alert(T('common.success'), T('trade.success', {side: T('common.sell')}));
                this.clear();
                if(this.props.onSuccess !== null)
                    this.props.onSuccess();
            }
        } catch (ex) {
            console.log(ex);
            this.setState({askError: ex.toString()});
            Alert.alert(T('common.error'), ex.toString());
        }
    }

    clear = () => {
        this.setState({
            askUnits: '',
            askPrice: '',
            askTotal: '',
            askValid: false,
            askError: '',
            confirmAsk: false,
        });
    }

    askError = () => {
        if(this.state.askError != '')
            Alert.alert(T('common.error'), this.state.askError);
    }

    setPrice = async (option) => {
        try {
            let price = await api.price(this.state.selectedPair);
            let quote = await api.quote(this.state.selectedPair);
            let selectedPrice = null;
            switch(option) {
                case 'last': selectedPrice = price.price[0]; break;
                case 'bid': selectedPrice = quote.bid; break;
                case 'ask': selectedPrice = quote.ask; break;
            }
            this.setState({askPrice: parseFloat(selectedPrice).toPrecision(places)});
        } catch (ex) {
            console.log(ex);
            Alert.alert(T('common.error'), ex.toString());
        }
    }

    calcOrder = (price, units, total, fltAvail) => {
        let fltPrice = parseFloat(price);
        let fltUnits = parseFloat(units);
        let fltTotal = parseFloat(total);
        let bPrice = !isNaN(fltPrice);
        let bUnits = !isNaN(fltUnits);
        let bTotal = !isNaN(fltTotal);
        if(bPrice && bUnits) {
            if(!( this.checkPositive(T('common.units'), fltUnits) &&
                  this.checkPositive(T('common.price'), fltPrice)))
                  return { error: T('trade.order.combo_invalid') }
            // recalc total
            fltTotal = fltUnits * fltPrice;
        }
        else if(bPrice && bTotal) {
            if(!( this.checkPositive(T('common.total'), fltTotal) &&
                  this.checkPositive(T('common.price'), fltPrice)))
                  return { error: T('trade.order.combo_invalid') }
            // recalc units
            fltUnits = fltTotal / fltPrice;
        }
        else if(bTotal && bUnits) {
            if(!( this.checkPositive(T('common.total'), fltTotal) &&
                  this.checkPositive(T('common.units'), fltUnits)))
                  return { error: T('trade.order.combo_invalid') }
            // calc price
            fltPrice = fltTotal / fltUnits;
        }
        else
            return { error: T('trade.order.combo_invalid') }
        if(fltAvail != null && fltAvail < fltTotal)
            return { error: T('trade.order.total_exceeds_balance', {total: fltTotal, available: fltAvail}) }
        return { 
            price: fltPrice.toPrecision(places),
            units: fltUnits.toPrecision(places),
            total: fltTotal.toPrecision(places),
            error: '',
        };
    }

    checkPositive = (editField, fltAmount) => {
        if(fltAmount > 0.0) return true;
        this.setState({
            bidError: T('common.positive', {edit_field: editField}),
            bidValid: false
        });
        return false;
    }

    maxSell = () => {
        let fltAvailable = parseFloat(this.state.balanceTrade.available);
        if(fltAvailable <= 0) {
            this.setState({askError: T('trade.sell.empty_trade', {coin: this.state.tradeCoin})});
            return;
        }

        let fltPrice = parseFloat(this.state.askPrice);
        if (isNaN(fltPrice)) {
            this.setState({askError: T('trade.order.no_price')});
            return;
        }

        let order = this.calcOrder(this.state.askPrice, this.state.balanceTrade.available, '');
        if(order.error !== '') {
            this.setState({
                askError: order.error
            });
            this.setState({askValid: false});
        }
        else {
            this.setState({
                askError: '',
                askPrice: order.price,
                askUnits: order.units,
                askTotal: order.total,
                askValid: true
            });
        }
    }

    recalcAsk = (fld, newVal) => {
        let fltAvailable = parseFloat(this.state.balanceTrade.available);
        if(fltAvailable <= 0) {
            this.setState({
                askError: T('trade.sell.empty_trade', {coin: this.state.tradeCoin}),
                askValid: false
            });
            return;
        }

        let price = this.state.askPrice;
        let units = this.state.askUnits;
        let total = this.state.askTotal;
        if(fld === 'units' || fld === 'price') total = '';
        else if(price !== '') units = ''; // total was edited, if price was set adjust units

        let order = this.calcOrder(price, units, total, fltAvailable);

        if(order.error !== '') {
            this.setState({
                askError: order.error,
                askValid: false
            });
        }
        else {
            this.setState({
                askError: '',
                askPrice: order.price,
                askUnits: order.units,
                askTotal: order.total,
                askValid: true
            });
        }
    }

    render() {
        return (
            <ScrollView contentContainerStyle={Styles.container}>
                {/* SELL */}
                <View style={localStyle.card}>
                    <View style={{flex: 1, flexDirection: "row", margin: 8}}>
                        <View style={localStyle.column}>
                            <Text style={localStyle.left}>{T('common.units')}</Text>
                            <Text style={localStyle.left}>{T('common.price')}</Text>
                            <Text style={localStyle.left}>{T('common.total')}</Text>
                        </View>
                        <View style={localStyle.column_middle}>
                            <View style={localStyle.rowEdit}>
                                <TouchableOpacity onPress={this.maxSell} style={localStyle.utilButton}>
                                    <LibertariaIcon name="max" size={Sizes.navIcon} color={Colors.buttonBG}/>
                                </TouchableOpacity>
                                <TextInput style={localStyle.input} keyboardType='phone-pad' placeholder={this.state.placeholder}
                                    placeholderTextColor={Colors.hintText} underlineColorAndroid='transparent'
                                    onChangeText={(t) => this.setState({askUnits: t})} onEndEditing={() => this.recalcAsk('units')} value={this.state.askUnits}/>
                            </View>
                            <View style={localStyle.rowEdit}>
                                <Menu onSelect={(value) => this.setPrice(value, false)}>
                                    <MenuTrigger style={localStyle.utilButton}>
                                        <LibertariaIcon name="atprice" size={Sizes.navIcon} color={Colors.buttonBG}/>
                                    </MenuTrigger>
                                    <MenuOptions>
                                        <MenuOption value='last'>
                                            <Text style={localStyle.menuItem}>{T('common.last')}</Text>
                                        </MenuOption>
                                        <MenuOption value='bid'>
                                            <Text style={localStyle.menuItem}>{T('common.bid')}</Text>
                                        </MenuOption>
                                        <MenuOption value='ask'>
                                            <Text style={localStyle.menuItem}>{T('common.ask')}</Text>
                                        </MenuOption>
                                    </MenuOptions>
                                </Menu>
                                <TextInput style={localStyle.input} keyboardType='phone-pad' placeholder={this.state.placeholder}
                                    placeholderTextColor={Colors.hintText} underlineColorAndroid='transparent'
                                    onChangeText={(t) => this.setState({askPrice: t})} onEndEditing={() => this.recalcAsk('price')} value={this.state.askPrice}/>
                            </View>
                            <View style={localStyle.rowEdit}>
                                <TouchableOpacity onPress={this.askError} style={localStyle.utilButton}>
                                    <LibertariaIcon name="attention" size={Sizes.navIcon} color={this.state.askError === '' ? Colors.hintText : Colors.warningBG}/>
                                </TouchableOpacity>
                                <TextInput style={localStyle.input} keyboardType='phone-pad' placeholder={this.state.placeholder}
                                    placeholderTextColor={Colors.hintText} underlineColorAndroid='transparent'
                                    onChangeText={(t) => this.setState({askTotal: t})} onEndEditing={() => this.recalcAsk('total')} value={this.state.askTotal}/>
                            </View>
                        </View>
                        <View style={localStyle.column}>
                            <Text style={localStyle.right}>{this.state.tradeCoin}</Text>
                            <Text style={localStyle.right}>{this.state.baseCoin}</Text>
                            <Text style={localStyle.right}>{this.state.baseCoin}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={this.onAsk} style={localStyle.sell} disabled={!this.state.askValid}>
                        <Text style={localStyle.buttonText}>{T('trade.sell.summary', {units: this.state.askUnits, coin: this.state.tradeCoin})}</Text>
                    </TouchableOpacity>
                </View>
                {/* Confirm SELL */}
                <Modal visible={this.state.confirmAsk} onRequestClose={() => { }} animationType={"slide"} transparent={true}>
                    <View style={ConfirmStyles.modal}>
                        <View style={{flex: 0, flexDirection: "column", padding: 5 }}>
                            { this.state.orderDetails.map((d) => (<Text key={d} style={{color: Colors.plutus, fontSize: 16, margin: 2}}>{d}</Text>)) }
                        </View>
                        <View style={{flex: 0, flexGrow: 1, justifyContent: 'center'}}>
                            <Text style={localStyle.confirm}>{this.state.confirmAskMessage}</Text>
                        </View>
                        <View style={{flexDirection: "row", margin: 8}}>
                            <TouchableOpacity onPress={this.cancelAsk} style={ConfirmStyles.buttonCancel}>
                                <Text style={ConfirmStyles.buttonText}>{T('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.sendAsk} style={ConfirmStyles.buttonConfirm}>
                                <Text style={ConfirmStyles.buttonText}>{T('common.sell')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const localStyle = StyleSheet.create({
    card: {
        flex: 1,
        flexDirection: "column",
        padding: 5,
        borderRadius: Sizes.cardCornerRadius,
        margin: 8,
        marginTop: 4,
        marginBottom: 4,
        backgroundColor: Colors.headerBG,
    },
    rowEdit: {
        flex: 1,
        flexDirection: "row",
        padding: 0,
        margin: 0,
    },
    column: {
        flex: 1,
        flexDirection: "column",
        margin: 0,
        padding: 0,
    },
    column_middle: {
        flex: 3,
        flexDirection: "column",
        margin: 0,
        padding: 0,
    },
    header: {
        flex: 0,
        height: 42,
        backgroundColor: Colors.headerBG,
        alignItems: "center",
        justifyContent: "center",
    },
    left: {
        fontSize: 18,
        flex: 1,
        color: Colors.headerFG,
        backgroundColor: Colors.headerBG,
        textAlign: 'right',
        alignItems: "center",
        padding: 6,
    },
    input: {
        fontSize: 18,
        flex: 3,
        color: Colors.bodyFG,
        backgroundColor: Colors.bodyBG,
        textAlign: 'center',
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 0,
    },
    right: {
        fontSize: 18,
        flex: 1,
        color: Colors.headerFG,
        backgroundColor: Colors.headerBG,
        textAlign: 'left',
        alignItems: "center",
        justifyContent: "center",
        padding: 6,
    },
    sell: {
        flex: 0,
        backgroundColor: Colors.sell,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        marginLeft: 30,
        marginRight: 30,
        marginTop: 0,
        marginBottom: 3,
        borderRadius: 3,
    },
    utilButton: {
        flex: 0,
        backgroundColor: Colors.bodyBG,
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
    },
    buttonText: { 
        color: Colors.buttonFG,
        textAlign: 'center',
        fontSize: 18,
    },
    menuItem: {
        fontSize: 18,
        padding: 5,
        textAlign: 'center',
    },
    confirm: {
        color: Colors.buttonBG,
        textAlign: 'center',
        alignContent: 'center',
        margin: 10,
        fontSize: 18,
    }
});

