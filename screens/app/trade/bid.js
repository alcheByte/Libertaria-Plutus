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
export default class Bid extends React.Component {
    constructor(props) {
        super(props);
        let pair = this.props.userStore.market.curCoinPair;
        this.state = {
            bidUnits: '', bidPrice: '', bidTotal: '',
            orderDetails: [],
            confirmBid: false,
            bidValid: false,
            bidError: '',
            confirmBidMessage: '',
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

    cancelBid = () => {
        this.setState({confirmBid: false});
    }

    onBid = () => {
        let fAmount = parseFloat(this.state.bidUnits);
        let fFee = fAmount * 0.005; // TODO get fee from API (details)
        let fTotal = fAmount - fFee;
        let subtotal = fAmount.toPrecision(places);
        let total = fTotal.toPrecision(places);
        let fee = fFee.toPrecision(places);
        details = [];
        details.push(`${T('common.price')}: ${this.state.bidPrice} ${this.state.baseCoin}/${this.state.tradeCoin}`,
                     `${T('common.amount')}: ${this.state.bidTotal} ${this.state.baseCoin}`,
                     `${T('common.subtotal')}: ${subtotal} ${this.state.tradeCoin}`,
                     `${T('common.fee')}: ${fee} ${this.state.tradeCoin}`,
                     `${T('common.total')}: ${total} ${this.state.tradeCoin}`);

        let confirmMsg = T('trade.buy.confirm', {
            units: total,
            tradeCoin: this.state.tradeCoin,
            total: this.state.bidTotal,
            baseCoin: this.state.baseCoin
        });
        this.setState({
            confirmBidMessage: confirmMsg,
            orderDetails: details,
            confirmBid: true
        });
    }

    sendBid = async () => {
        try {
            let result = await api.bid(this.state.selectedPair, this.state.bidPrice, this.state.bidUnits);
            if(result.err) {
                this.setState({
                    bidError: result.err,
                });
                Alert.alert(T('common.error'), result.err);
            }
            else {
                Alert.alert(T('common.success'), T('trade.success', {side: T('common.buy')}));
                this.clear();
                if(this.props.onSuccess !== null)
                    this.props.onSuccess();
            }
        } catch (ex) {
            console.log(ex);
            this.setState({bidError: ex.toString()});
            Alert.alert(T('common.error'), ex.toString());
        }
    }

    clear = () => {
        this.setState({
            bidUnits: '',
            bidPrice: '',
            bidTotal: '',
            bidValid: false,
            bidError: '',
            confirmBid: false
        });
    }

    bidError = () => {
        if(this.state.bidError != '')
            Alert.alert(T('common.error'), this.state.bidError);
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
            this.setState({bidPrice: parseFloat(selectedPrice).toPrecision(places)});
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

    maxBuy = () => {
        let fltAvailable = parseFloat(this.state.balanceBase.available);
        if(fltAvailable <= 0) {
            this.setState({bidError: T('trade.buy.empty_base', {coin: this.state.baseCoin}), bidValid: false});
            return;
        }

        let fltPrice = parseFloat(this.state.bidPrice);
        if (isNaN(fltPrice)) {
            this.setState({bidError: T('trade.order.no_price'), bidValid: false});
            return;
        }

        let order = this.calcOrder(this.state.bidPrice, '', this.state.balanceBase.available);
        if(order.error !== '') {
            this.setState({
                bidError: order.error,
                bidValid: false
            });
        }
        else {
            this.setState({
                bidError: '',
                bidPrice: order.price,
                bidUnits: order.units,
                bidTotal: order.total,
                bidValid: true
            });
        }
    }

    recalcBid = (editField, newVal) => {
        let fltAvailable = parseFloat(this.state.balanceBase.available);
        if(fltAvailable <= 0) {
            this.setState({
                bidError: T('trade.buy.empty_base', {coin: this.state.baseCoin}),
                bidValid: false
            });
            return;
        }

        let price = this.state.bidPrice;
        let units = this.state.bidUnits;
        let total = this.state.bidTotal;
        if(editField === 'units' || editField === 'price') total = '';
        else if(price !== '') units = ''; // total was edited, if price was set adjust units

        let order = this.calcOrder(price, units, total, fltAvailable);
        if(order.error !== '') {
            this.setState({
                bidError: order.error,
                bidValid: false
            });
        }
        else {
            this.setState({
                bidError: '',
                bidPrice: order.price,
                bidUnits: order.units,
                bidTotal: order.total,
                bidValid: true});
        }
    }

    render() {
        return (
            <ScrollView contentContainerStyle={Styles.container}>
                {/* BUY */}
                <View style={localStyle.card}>
                    <View style={{flex: 1, flexDirection: "row", margin: 8}}>
                        <View style={localStyle.column}>
                            <Text style={localStyle.left}>{T('common.units')}</Text>
                            <Text style={localStyle.left}>{T('common.price')}</Text>
                            <Text style={localStyle.left}>{T('common.total')}</Text>
                        </View>
                        <View style={localStyle.column_middle}>
                            <View style={localStyle.rowEdit}>
                                <TouchableOpacity onPress={this.maxBuy} style={localStyle.utilButton}>
                                    <LibertariaIcon name="max" size={Sizes.navIcon} color={Colors.buttonBG}/>
                                </TouchableOpacity>
                                <TextInput style={localStyle.input} keyboardType='phone-pad' placeholder={this.state.placeholder}
                                    placeholderTextColor={Colors.hintText} underlineColorAndroid='transparent'
                                    onChangeText={(t) => this.setState({bidUnits: t})} onEndEditing={() => this.recalcBid('units')} value={this.state.bidUnits}/>
                            </View>
                            <View style={localStyle.rowEdit}>
                                <Menu onSelect={(value) => this.setPrice(value)}>
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
                                    onChangeText={(t) => this.setState({bidPrice: t})} onEndEditing={() => this.recalcBid('price')} value={this.state.bidPrice}/>
                            </View>
                            <View style={localStyle.rowEdit}>
                                <TouchableOpacity onPress={this.bidError} style={localStyle.utilButton}>
                                    <LibertariaIcon name="attention" size={Sizes.navIcon} color={this.state.bidError === '' ? Colors.hintText : Colors.warningBG}/>
                                </TouchableOpacity>
                                <TextInput style={localStyle.input} keyboardType='phone-pad' placeholder={this.state.placeholder}
                                    placeholderTextColor={Colors.hintText} underlineColorAndroid='transparent'
                                    onChangeText={(t) => this.setState({bidTotal: t})} onEndEditing={() => this.recalcBid('total')} value={this.state.bidTotal}/>
                            </View>
                        </View>
                        <View style={localStyle.column}>
                            <Text style={localStyle.right}>{this.state.tradeCoin}</Text>
                            <Text style={localStyle.right}>{this.state.baseCoin}</Text>
                            <Text style={localStyle.right}>{this.state.baseCoin}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={this.onBid} style={localStyle.buy} disabled={!this.state.bidValid}>
                        <Text style={localStyle.buttonText}>{T('trade.buy.summary', {units: '', coin: this.state.tradeCoin})}</Text>
                    </TouchableOpacity>
                </View>
                {/* Confirm Buy */}
                <Modal visible={this.state.confirmBid} onRequestClose={() => { }} animationType={"slide"} transparent={true}>
                    <View style={ConfirmStyles.modal}>
                        <View style={{flex: 0, flexDirection: "column", padding: 5 }}>
                            { this.state.orderDetails.map((d) => (<Text key={d} style={{color: Colors.plutus, fontSize: 16, margin: 2}}>{d}</Text>)) }
                        </View>
                        <View style={{flex: 0, flexGrow: 1, justifyContent: 'center'}}>
                            <Text style={localStyle.confirm}>{this.state.confirmBidMessage}</Text>
                        </View>
                        <View style={{flexDirection: "row", margin: 8}}>
                            <TouchableOpacity onPress={this.cancelBid} style={ConfirmStyles.buttonCancel}>
                                <Text style={ConfirmStyles.buttonText}>{T('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.sendBid} style={ConfirmStyles.buttonConfirm}>
                                <Text style={ConfirmStyles.buttonText}>{T('common.buy')}</Text>
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
    buy: {
        flex: 0,
        backgroundColor: Colors.buy,
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
    },
});

