import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '../config';

export class AmountText extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let places = this.props.places !== undefined ? this.props.places : 4;
        let fltAmount = parseFloat(this.props.amount);
        if(isNaN(fltAmount)) return null;
        let parts = fltAmount.toFixed(places).split('.');
      	let txtStyle = {
			color: this.props.isBuy !== null ? ( this.props.isBuy ? Colors.buy : Colors.sell) : Colors.headerFG,
			textAlign: this.props.textAlign !== undefined ? this.props.textAlign : 'justify',
			fontSize: this.props.fontSize !== undefined ? this.props.fontSize : 13,
		}
        return ( <Text style={txtStyle}>
                    <Text style={{fontFamily: 'numbers-bold'}}>{parts[0]}</Text>
                    <Text>.</Text>
                    <Text style={{fontFamily: 'numbers-light'}}>{parts[1]}</Text>
                </Text> );
    }
}
