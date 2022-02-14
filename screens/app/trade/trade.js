import React from 'react';
import { observer, inject } from 'mobx-react'
import { ScrollView, Text, TextInput, View, Button, TouchableOpacity, StyleSheet, Alert, Modal, RefreshControl } from 'react-native';
import { Container } from 'native-base';

import { Colors, Sizes } from '../../../config';
import { Styles, ConfirmStyles } from '../../../config/styles';

import * as api from "../../../api/apiClient";
import { T } from '../../../localize/localizer';
import Persist from '../../../utility/persist'

import { LibertariaIcon } from '../../../assets/LibertariaIcon';
import { PlutusHeader } from '../../../components/plutusheader'

import Orderbook from './orderbook';
import MyOrders from './myorders';
import MyTrades from './mytrades';
import Ask from './ask';
import Bid from './bid';

let places = 8;

@inject('userStore') @observer
export default class Trade extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAsk: false, showBid: false, showMyOrders: true, showMyTrades: true,
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
            let pair = this.props.userStore.market.curCoinPair.name;
            let myorders = await api.myorders(pair);
            let mytrades = await api.mytrades(pair);
            let orderbook = await api.orderbook(pair);
            this.setState({
                    myOrders: myorders,
                    myTrades: mytrades,
                    orderBook: orderbook,
                    refreshing: false,
            });
        } catch(ex) {
            console.log("Error accessing API: " + ex);
        }
    }

    toggleBuy = () => {
        var showing = this.state.showBid == true;
        this.setState({
            showBid: !showing,
            showMyOrders: showing,
            showMyTrades: showing,
            showAsk: false,
        }, () => {
            this.refs._scrollView.scrollToEnd();
        });
    }

    toggleAsk = () => {
        var showing = this.state.showAsk == true;
        this.setState({
            showAsk: !showing,
            showMyOrders: showing,
            showMyTrades: showing,
            showBid: false,
        });
    }

    onBidSuccess = async () => {
        // console.log('onBidSuccess');
        await this.refreshAll();
        this.setState({
            showBid: false,
            showMyOrders: true,
            showMyTrades: true,
        })
    }

    onAskSuccess = async () => {
        // console.log('onAskSuccess');
        await this.refreshAll();
        this.setState({
            showAsk: false,
            showMyOrders: true,
            showMyTrades: true,
        })
    }

    onCancelOrder = async (id) => {
        await this.refreshAll();
    }

    render() {
        return (
            <Container>
                <PlutusHeader onSelectedPairChange={this.refreshAll}  {...this.props}/>
                <ScrollView contentContainerStyle={Styles.container} style={{backgroundColor: Colors.bodyBG}} ref="_scrollView" 
                            onContentSizeChange={() => {if(this.state.showBid) this.refs._scrollView.scrollToEnd();}}
                            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)}
                                                            style={{backgroundColor: Colors.bodyBG}}
                                                            tintColor={Colors.select} colors={['#0F72CC']} progressBackgroundColor={Colors.bodyBG}
                                                            title=''/>}>
                    <Orderbook orderBook={this.state.orderBook}
                            onBuy={this.toggleBuy}
                            onAsk={this.toggleAsk} />
                    { this.state.showBid && <Bid onSuccess={this.onBidSuccess}/> }
                    { this.state.showAsk && <Ask onSuccess={this.onAskSuccess}/> }
                    { this.state.showMyOrders && <MyOrders myOrders={this.state.myOrders} onCancelOrder={this.onCancelOrder}/> }
                    { this.state.showMyTrades && <MyTrades myTrades={this.state.myTrades}/> }
                </ScrollView>
            </Container>
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
    row: {
        flex: 1,
        flexDirection: "row",
        margin: 8,
        padding: 0,
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
    button: {
        flex: 0,
        backgroundColor: Colors.buttonBG,
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
    missing: {
        color: Colors.hintText,
        textAlign: 'center',
    },
    cancelbtn: {
        backgroundColor: Colors.errorBG,
        width: 30,
    },
    cancelbtntext: {
        color: Colors.errorText,
        textAlign: 'center',
    },
});

