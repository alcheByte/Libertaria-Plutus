import React from 'react';
import { Header, Left, Right, Body, Button, Title, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { T } from '../localize/localizer';

export class PopHeader extends React.Component {
    onPop = () => {
        if(this.props.onPop != null) {
            this.props.onPop();
        } else {
            Actions.pop()
        }
    }

    render() {
        return (
            <Header noright style={{borderBottomWidth: 0, flexDirection: 'column'}}>
                <Body style={{flexDirection: 'row', alignSelf: 'stretch', alignItems: 'flex-end'}}>
                    <Button transparent onPress={this.onPop} 
                            style={{flex: 0, alignSelf: 'flex-end'}}>
                        <Icon name='arrow-back' />
                    </Button>
                    <Title style={{flex: 1, textAlign: 'left', marginLeft: 10, paddingBottom: 10}}>{this.props.title}</Title>
                </Body>
            </Header>
        );
    }
}

