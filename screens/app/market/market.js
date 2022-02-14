import React from 'react';
import { inject, observer } from 'mobx-react/native';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Container, Header, Button, Text } from 'native-base';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

// chart options
// import { VictoryTheme, VictoryChart, VictoryAxis, VictoryCandlestick } from "victory-native";
// import { ArtyCharty } from 'arty-charty';
import { LibertariaIcon } from '../../../assets/LibertariaIcon'
import { Colors, Sizes } from '../../../config';
import { Styles } from '../../../config/styles';

import api from "../../../api/apiClient.js";
import { T } from '../../../localize/localizer';
import Persist from '../../../utility/persist.js'

import { PlutusHeader } from '../../../components/plutusheader'
import { SideText } from '../../../components/sidetext'
import { PriceText } from '../../../components/pricetext'
import { AmountText } from '../../../components/amounttext';

const places = 8;

@inject('userStore') @observer
export default class Market extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            chartdata: [],
            refreshing: false,
        }
    }

    async componentDidMount() {
        await this._onRefresh();
    }

    _onRefresh = async () => {
        this.setState({
            refreshing: true
        }, this.refreshAll);
    }

    refreshAll = async () => {
        try {
            var curPair = this.props.userStore.market.curCoinPair.name;
            let res = await api.trades(curPair);
            let trades = res.trades;
            // let chart = trades.map( t => {
            //     let timestamp = new Date(t.time);
            //     return { x: timestamp, open: t.price, close: t.price, high: t.price, low: t.price };
            // });
            let history = trades.map( t => {
                let date = new Date(t.time);
                return {date: date.toLocaleDateString(), time: date.toLocaleTimeString(), price: t.price, size: t.size};
            });
            this.setState({
                history,
                refreshing: false,
                // chartdata: chart
            });
        } catch(ex) {
            console.log("Error accessing API: " + ex);
        }
    }

    TradeHistory = () => {
        const noTrades = () => (<Text style={localStyles.missing}>{T('trade.mytrades.none')}</Text>);
        const trades = this.state.history;
        let rows = null;
        let lastPrice = '0';
        if(trades.length > 0) rows = trades.map( t => {
            let fltPrice = parseFloat(t.price);
            let fltPrev = parseFloat(lastPrice);
            let isBuy = fltPrice == fltPrev ? null : fltPrice > fltPrev ? true : false;
            // console.log(lastPrice + ' >> ' + t.price + ' ' + isBuy);
            let prevPrice = lastPrice;
            lastPrice = t.price;
            return [
                <SideText text={t.date} isBuy={isBuy} textAlign='center'/>,
                <SideText text={t.time} isBuy={isBuy} textAlign='center'/>,
                <PriceText price={t.price} pricePrevious={prevPrice} isBuy={isBuy} textAlign='center'/>,
                <AmountText amount={t.size} isBuy={isBuy} textAlign='right'/>,
            ]
        });
        else rows = [[noTrades()]];
        return rows.reverse();
    }

    render() {
        // console.log(this.props);
        const _histTitle = [T('market.trade_history')];
        const _histHeader = [T('market.date'), T('market.time'), T('market.price'), T('market.amount')];
        const _history = this.TradeHistory();
        return (
            <Container>
                <PlutusHeader onSelectedPairChange={this.refreshAll} {...this.props}/>
                <ScrollView contentContainerStyle={Styles.container} style={{backgroundColor: Colors.bodyBG}}
                            refreshControl={
                                <RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)}
                                    style={{backgroundColor: Colors.bodyBG}}
                                    tintColor={Colors.select} colors={['#0F72CC']} progressBackgroundColor={Colors.bodyBG}
                                    title='updating' titleColor={Colors.select}/>
                            }>
                    <View style={localStyles.card}>
                        <Table borderStyle={{borderWidth: 0}}>
                            <Row data={_histTitle} style={localStyles.head} textStyle={Styles.title}/>
                            <Row data={_histHeader} style={localStyles.tableHead} textStyle={localStyles.tableHeadText}/>
                            <Rows data={_history} style={localStyles.row} textStyle={localStyles.rowText}/>
                        </Table>
                    </View>
                    {/* <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 25 }} scale={{ x: "time" }}>
                        <VictoryAxis tickFormat={(t) => `${t.getDate()}/${t.getMonth()}`}/>
                        <VictoryAxis dependentAxis/>
                        <VictoryCandlestick candleColors={{ positive: "#5f5c5b", negative: "#c43a31" }} data={this.state.chartdata}/>
                    </VictoryChart> */}
                    {/* <ArtyCharty clickFeedback={true} interactive={true} animated={true}
                        data={[{
                            type: 'candlestick',
                            lineColor: 'blue',
                            fillUp:  'green',
                            fillDown: 'red',
                            drawChart: true,
                            data: this.state.chartdata}
                    ]} /> */}
                </ScrollView>
            </Container>
        );
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
        backgroundColor: Colors.errorBG,
        width: 30,
    },
    cancelbtntext: {
        color: Colors.errorText,
        textAlign: 'center',
    },
    row: {
        height: 22,
        backgroundColor: Colors.bodyBG,
    },
    rowText: {
        flex: 1,
        margin: 5,
        color: Colors.bodyFG,
    },
});
