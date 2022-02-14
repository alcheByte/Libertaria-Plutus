import React, { Component } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';

import { Colors } from '../config';

emphasizeDiff = (price, prev) => {
    let i = 0;
    return [...price].map(c => {
        let diff = prev.length > i ? parseInt(prev[i]) != parseInt(c) : true;
        return (<Text key={i++} style={{fontFamily: diff ? 'numbers-bold' : 'numbers-light'}}>{c}</Text>);
    });
};

emphasizeDepth = (price) => {
    let i = 0;
    let nonZeroLen = price.length;
    for(var c of [...price].reverse()) {
        if(c === '0') nonZeroLen--;
        else break;
    }
    // console.log(`trimmed: ${price.substring(0, nonZeroLen)}, nonZeroLen: ${nonZeroLen}`);
    return [...price].map(c => {
        return (<Text key={i} style={{fontFamily: i++ < nonZeroLen ? 'numbers-bold' : 'numbers-light'}}>{c}</Text>);
    });
};

export class PriceText extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let fltPrice = parseFloat(this.props.price);
        if(isNaN(fltPrice)) return null;

        let txtStyle = {
			color: this.props.isBuy !== null ? ( this.props.isBuy ? Colors.buy : Colors.sell) : Colors.headerFG,
            textAlign: this.props.textAlign !== null ? this.props.textAlign : 'justify',
            fontSize: this.props.fontSize !== null ? this.props.fontSize : 13,
		}

        let places = this.props.places !== undefined ? this.props.places : 6;
        let partsPrice = fltPrice.toFixed(places).split('.');
        
        let fltPrevious = parseFloat(this.props.pricePrevious);
        if(isNaN(fltPrevious)) {
            return ( 
                <Text style={txtStyle}>
                    <Text style={{fontFamily: 'numbers-bold'}}>{partsPrice[0]}</Text>
                    <Text>.</Text>
                    { emphasizeDepth(partsPrice[1]) }
                </Text>
            );
        }
        else {
            let partsPrevious = fltPrevious.toFixed(places).split('.');
            return (
                <Text style={txtStyle}>
                    { emphasizeDiff(partsPrice[0], partsPrevious[0]) }
                    <Text>.</Text>
                    { emphasizeDiff(partsPrice[1], partsPrevious[1]) }
                </Text>
            );
        }
    }
}
