import Expo from 'expo';
import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ScrollView, View, Alert } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

import { Colors, Sizes } from '../../../config';
import { Styles } from '../../../config/styles';

import api from "../../../api/apiClient.js";
import { T } from '../../../localize/localizer';

import { SideText } from '../../../components/sidetext'
import { PriceText } from '../../../components/pricetext';
import { AmountText } from '../../../components/amounttext';

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
    colHead: {
        height: 24,
        backgroundColor: Colors.headerBG,
        borderWidth: 0,
    },
    colHeadText: { 
        color: Colors.headerFG,
        textAlign: 'center',
        fontSize: 11,
    },
    btn: {
        flex: 0,
        backgroundColor: Colors.buttonBG,
    },
    btntext: {
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

export default class Orderbook extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            onBuy: props.onBuy,
            onAsk: props.onAsk,
            orderBook: props.orderBook,
            selectedPair: props.selectedPair, tradeCoin: '', baseCoin: '',
        }
    }

    async componentWillReceiveProps(nextProps) {
        //console.log(nextProps);
        if(this.state.orderBook != nextProps.orderBook)
        {
            this.setState({ orderBook: nextProps.orderBook });
        }
        if(this.state.selectedPair != nextProps.selectedPair)
        {
            this.setState({
                selectedPair: nextProps.selectedPair,
                tradeCoin: nextProps.selectedPair.split('-')[0],
                baseCoin: nextProps.selectedPair.split('-')[1],
            });
        }
    }

    _loadOrderBook = (book) => {
        // console.log(book);
        const bid = book.bid || [];
        const ask = book.ask || [];

        let bids = bid.sort( (a,b) => parseFloat(b.price) - parseFloat(a.price) );
        let asks = ask.sort( (a,b) => parseFloat(a.price) - parseFloat(b.price) );

        bids = bids.map( b => [b.price*b.size, b.size, b.price] );
        asks = asks.map( a => [a.price, a.size, a.price*a.size] );

        let orders = [];
        var count = Math.max(bids.length, asks.length);
        for(var i = 0; i < count; i++)
        {
            let row = [];
            if(i< bids.length)
                row.push(bids[i][0], bids[i][1], bids[i][2]);
            else
                row.push(null,null,null);
            if(i< asks.length)
                row.push(asks[i][0],asks[i][1],asks[i][2]);
            else
                row.push(null,null,null);
            orders.push(row);
        }
        return orders;
    }

    OrderBook = (book) => {
        if(!book) return null;
        const orders = this._loadOrderBook(book);
        return orders.map( o =>
            [ 
                <AmountText amount={o[0]} isBuy={true} fontSize={12} textAlign='right' />,
                <AmountText amount={o[1]} isBuy={null} fontSize={12} textAlign='right' />,
                <PriceText price={o[2]} isBuy={true} fontSize={12} textAlign='right'/>,
                <PriceText price={o[3]} isBuy={false} fontSize={12} textAlign='right' />,
                <AmountText amount={o[4]} isBuy={null} fontSize={12} textAlign='right' />,
                <AmountText amount={o[5]} isBuy={false} fontSize={12} textAlign='right' />,
            ]
        );
    }

    render() {
        const btn = (label, color, action) => (
            <TouchableOpacity onPress={action} style={{flex: 1, backgroundColor: color, justifyContent: 'center'}}>
                <Text style={localStyles.btntext}>{label}</Text>
            </TouchableOpacity>
        );

        const _orderTitle = [T('trade.orderbook.title')];
        const _bookHeader = [
            T('trade.orderbook.header.total') + this.state.baseCoin,
            T('trade.orderbook.header.size') + this.state.tradeCoin,
            T('trade.orderbook.header.bid') + this.state.baseCoin,
            T('trade.orderbook.header.ask') + this.state.baseCoin,
            T('trade.orderbook.header.size') + this.state.tradeCoin,
            T('trade.orderbook.header.total') + this.state.baseCoin,
        ];
        const _orderbook = this.OrderBook(this.state.orderBook);
        const _orderbuttons = [btn(T('common.buy'), Colors.buy, this.state.onBuy), btn(T('common.sell'), Colors.sell, this.state.onAsk)];

        return (<ScrollView contentContainerStyle={Styles.container}>
            <View style={localStyles.card}>
                <Table borderStyle={{borderWidth: 0}}>
                    <Row data={_orderTitle} style={localStyles.head} textStyle={Styles.title}/>
                    <Row data={_bookHeader} style={localStyles.colHead} textStyle={localStyles.colHeadText}/>
                    <Rows data={_orderbook} style={localStyles.row} textStyle={localStyles.rowText}/>
                    <Row data={_orderbook ? _orderbuttons : null} style={{height: 39}}/>
                </Table>
            </View>
        </ScrollView>);
    }
}
