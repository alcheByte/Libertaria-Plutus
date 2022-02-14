import React from 'react';
import { observer, inject } from 'mobx-react'
import { StyleSheet, TouchableOpacity, Text, ScrollView, View, Alert } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

import { Colors, Sizes } from '../../../config';
import { Styles } from '../../../config/styles';

import api from "../../../api/apiClient";
import { T } from '../../../localize/localizer';

import { SideText } from '../../../components/sidetext'
import { PriceText } from '../../../components/pricetext';
import { AmountText } from '../../../components/amounttext';
import { LibertariaIcon } from '../../../assets/LibertariaIcon';

@inject('userStore') @observer
export default class MyOrders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myOrders: props.myOrders,
            cancelResult: '',
        }
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.myOrders != nextProps.myOrders) {
            this.setState({myOrders: nextProps.myOrders});
        }
    }

    MyOrders = () => {
        const noOrders = () => (<Text style={localStyles.missing}>{T('trade.myorders.none')}</Text>);
        const cancel = (value) => (
            <TouchableOpacity style={{flex: 1, justifyContent: 'center'}} onPress={() => this.confirmCancel(value)}>
                <LibertariaIcon style={{alignSelf: 'center'}} name='close-button-round' color={Colors.action} size={18}/>
            </TouchableOpacity>
        );
        const orders = this.state.myOrders;
        if(!orders) return null;
        let rows = null;
        if(orders.length > 0) rows = orders.map( o => { 
            let isBuy = o.side === 'bid';
                return [
                    <SideText text={o.time.replace('T', '\n')} isBuy={isBuy} textAlign='center' fontSize={10}/>,
                    <SideText text={isBuy ? T('common.buy') : T('common.sell')} isBuy={isBuy} textAlign='center'/>,
                    <PriceText price={o.price} isBuy={isBuy} textAlign='center'/>,
                    <AmountText amount={o.size} isBuy={isBuy} textAlign='right'/>,
                    cancel(o)
                ]
            });
        else rows = [[noOrders()]];
        return rows;
    }

    cancelOrder = async (order) => {
        let coinPair = this.props.userStore.market.curCoinPair.name;
        try {
            let result = await api.cancel(coinPair, order.id);
            if(result.err) {
                this.setState({cancelResult: result.err});
                // Alert.alert(T('common.error'), result.err);
            }
            else {
                this.setState({cancelResult: T('trade.myorders.order_cancelled')});
                // Alert.alert(T('common.success'), T('trade.myorders.order_cancelled'));
                if(this.props.onCancelOrder !== null)
                    this.props.onCancelOrder(order.id);
            }
        } catch (ex) {
            console.log(ex);
            Alert.alert(T('common.error'), ex.toString());
        }
    }

    confirmCancel = (order) => {
        let ans = Alert.alert(
            T('common.confirm'),
            T('trade.myorders.cancel_order', {
                side: order.side,
                size: order.size,
                tradecoin: order.tradedcoin,
                price: order.price,
                basecoin: order.basecoin
            }),
            [
               {text: T('common.no'), onPress: () => {}, style: 'cancel'},
               {text: T('common.yes'), onPress: () => this.cancelOrder(order) },
            ],
            { cancelable: false }
        );
    }

    render() {
        const _myHeader = [T('trade.myorders.title')];
        const _myCols = [
            T('trade.myorders.cols.date'),
            T('trade.myorders.cols.side'),
            T('trade.myorders.cols.price'),
            T('trade.myorders.cols.size'),
            ''];
        const _myOrders = this.MyOrders();

        return (<ScrollView contentContainerStyle={Styles.container}>
            <View style={localStyles.card}>
                <Table borderStyle={{borderWidth: 0}}>
                    <Row data={_myHeader} style={localStyles.head} textStyle={Styles.title}/>
                    <Row data={_myCols} style={localStyles.tableHead} textStyle={localStyles.tableHeadText}/>
                    <Rows data={_myOrders} style={localStyles.row} textStyle={localStyles.rowText}/>
                </Table>
            </View>
        </ScrollView>);
    }
}

const localStyles = StyleSheet.create({
    card: {
        flex: 1,
        flexDirection: "column",
        padding: 2,
        backgroundColor: Colors.headerBG,
    },
    head: {
        height: 36,
        backgroundColor: Colors.headerBG,
        borderWidth: 0,
    },
    tableHead: {
        height: 24,
        backgroundColor: Colors.headerBG,
        borderWidth: 0,
    },
    tableTitleText: { 
        color: Colors.headerFG,
        textAlign: 'center',
        fontSize: 18,
    },
    tableHeadText: { 
        color: Colors.headerFG,
        textAlign: 'center',
        fontSize: 14,
    },
    cancelbtn: {
        flexDirection: 'row',
        flexGrow: 1,
        backgroundColor: Colors.errorBG,
        justifyContent: 'center',
        alignContent: 'center',
        marginTop: 3,
        marginLeft: 7,
        marginRight: 7,
        marginBottom: 4,
    },
    cancelbtntext: {
        alignSelf: 'center',
        color: Colors.buttonFG,
        textAlign: 'center',
    },
    row: {
        height: 24,
        backgroundColor: Colors.bodyBG,
    },
    rowText: {
        flex: 1,
        margin: 5,
        color: Colors.bodyFG,
    },
    missing: {
        color: Colors.hintText,
        textAlign: 'center',
    }
});

