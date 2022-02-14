import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ScrollView, View, Alert } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

import { Colors, Sizes } from '../../../config';
import { Styles } from '../../../config/styles';

import api from "../../../api/apiClient";
import rw from '../../../api/requestWrapper';
import { T } from '../../../localize/localizer';
import { PriceText } from '../../../components/pricetext';
import { AmountText } from '../../../components/amounttext';
import { SideText } from '../../../components/sidetext'

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
        backgroundColor: Colors.errorBG,
        width: 30,
    },
    cancelbtntext: {
        color: Colors.errorText,
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

export default class MyTrades extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myTrades: props.myTrades,
            selectedPair: props.selectedPair,
        }
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.myTrades != nextProps.myTrades) {
            this.setState({myTrades: nextProps.myTrades});
        }
    }

    MyTrades = () => {
        const noOrders = () => (<Text style={localStyles.missing}>{T('trade.mytrades.none')}</Text>);
        const orders = this.state.myTrades;
        if(!orders) return null;
        let rows = null;
        let me = rw.username();
        if(orders.length > 0) rows = orders.reverse().map( o => { 
            let isBuy = o.bid == me; return [ 
                <SideText text={o.time.replace('T', '\n')} isBuy={isBuy} textAlign='center' fontSize={10}/>,
                <SideText text={isBuy ? T('common.buy') : T('common.sell')} isBuy={isBuy} textAlign='center'/>,
                <PriceText price={o.price} isBuy={isBuy} textAlign='center'/>,
                <AmountText amount={o.size} isBuy={isBuy} textAlign='right'/>,
                ]
            });
        else rows = [[noOrders()]];
        return rows;
    }
    
    render() {
        const _myHeader = [T('trade.mytrades.title')];
        const _myCols = [
            T('trade.mytrades.cols.date'),
            T('trade.mytrades.cols.side'),
            T('trade.mytrades.cols.price'),
            T('trade.mytrades.cols.size')
        ];
        const _myTrades = this.MyTrades();

        return (<ScrollView contentContainerStyle={Styles.container}>
            <View style={localStyles.card}>
                <Table borderStyle={{borderWidth: 0}}>
                    <Row data={_myHeader} style={localStyles.head} textStyle={Styles.title}/>
                    <Row data={_myCols} style={localStyles.tableHead} textStyle={localStyles.tableHeadText}/>
                    <Rows data={_myTrades} style={localStyles.row} textStyle={localStyles.rowText}/>
                </Table>
            </View>
        </ScrollView>);
    }
}
