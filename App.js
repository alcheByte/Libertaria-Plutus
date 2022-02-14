import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react/native';
import { Provider } from "mobx-react/native";
import { Font, DangerZone } from 'expo';
import { Alert, Clipboard, StatusBar, Platform, AsyncStorage, View } from 'react-native';
import { Router, Scene, Tabs, Modal, Actions } from 'react-native-router-flux';
import { Footer, FooterTab, Button, Text, StyleProvider } from 'native-base';
import { SecureStore } from 'expo';

import getTheme from './native-base-theme/components/index';
import appTheme from './native-base-theme/variables/commonColor'
import { MenuProvider } from 'react-native-popup-menu';

const { Localization } = DangerZone;

import { Colors, Sizes, Keys } from './config';
import { Styles, ConfirmStyles } from './config/styles';
import { T, setLocale } from './localize/localizer';
import { LibertariaIcon } from './assets/LibertariaIcon'
import { AppStateMonitor } from './components/appstatemonitor';

import api from "./api/apiClient";

import stores from './model/userstore';

import Launch from './screens/launch';
import { FirstUse } from './screens/auth/firstuse';
import { Welcome } from './screens/auth/welcome';
import { LockScreen } from './screens/auth/lockscreen';
import { Settings } from './screens/app/settings';
import { Support } from './screens/app/support';

import Market from './screens/app/market/market';
import Trade from './screens/app/trade/trade';
import Wallet from './screens/app/wallet/wallet';
import ICOs from './screens/app/icos/icos';

TabBar = props => {
    return (
        <Footer style={{backgroundColor: Colors.headerBG, borderTopWidth: 0, paddingBottom: appTheme.isIPhoneX ? appTheme.Inset.portrait.bottomInset : 0}}>
            <FooterTab locked>
                <Button vertical active={props.navigation.state.index === 0} onPress={()=> Actions.jump("market")} style={{flex: 1, justifyContent: 'center', alignSelf: 'stretch'}}>
                    <LibertariaIcon name="chart" size={Sizes.navIcon} color={props.navigation.state.index === 0 ? Colors.plutus : Colors.action} style={{alignSelf: 'center'}}/>
                    <Text style={{textAlign: 'center', paddingLeft: 0, paddingRight: 0, lineHeight: 25, paddingTop: 3}}>{T('market.tab')}</Text>
                </Button>
                <Button vertical active={props.navigation.state.index === 1} onPress={()=> Actions.jump("trade")} style={{flex: 1, justifyContent: 'center', alignSelf: 'stretch'}}>
                    <LibertariaIcon name="trade" size={Sizes.navIcon} color={props.navigation.state.index === 1 ? Colors.plutus : Colors.action} style={{alignSelf: 'center'}}/>
                    <Text style={{textAlign: 'center', paddingLeft: 0, paddingRight: 0, lineHeight: 25, paddingTop: 3}}>{T('trade.tab')}</Text>
                </Button>
                <Button vertical active={props.navigation.state.index === 2} onPress={()=> Actions.jump("wallet")} style={{flex: 1, justifyContent: 'center', alignSelf: 'stretch'}}>
                    <LibertariaIcon name="wallet" size={Sizes.navIcon} color={props.navigation.state.index === 2 ? Colors.plutus : Colors.action} style={{alignSelf: 'center'}}/>
                    <Text style={{textAlign: 'center', paddingLeft: 0, paddingRight: 0, lineHeight: 25, paddingTop: 3}}>{T('wallet.tab')}</Text>
                </Button>
                <Button vertical active={props.navigation.state.index === 3} onPress={()=> Actions.jump("icos")} style={{flex: 1, justifyContent: 'center', alignSelf: 'stretch'}}>
                    <LibertariaIcon name="rocket" size={Sizes.navIcon} color={props.navigation.state.index === 3 ? Colors.plutus : Colors.action} style={{alignSelf: 'center'}}/>
                    <Text style={{textAlign: 'center', paddingLeft: 0, paddingRight: 0, lineHeight: 25, paddingTop: 3}}>{T('icos.tab')}</Text>
                </Button>
            </FooterTab>
        </Footer>
    );
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
        }
    }

    componentWillMount() {
        this.init();
    }

    init = async () => {
        await Font.loadAsync({
            'libertaria': require('./assets/fonts/libertaria.ttf'),
            'numbers-light': require('./assets/fonts/Roboto-Light.ttf'),
            'numbers-thin': require('./assets/fonts/Roboto-Thin.ttf'),
            'numbers-medium': require('./assets/fonts/Roboto-Medium.ttf'),
            'numbers-regular': require('./assets/fonts/Roboto-Regular.ttf'),
            'numbers-bold': require('./assets/fonts/Roboto-Bold.ttf'),
            'plutus': require('./assets/fonts/Metrosant-Regular.otf'),
            'gotham': require('./assets/fonts/gothambook.ttf'),
        });
        
        var userStore = stores.userStore;

        // load persisted settings
        var userSettings = await AsyncStorage.getItem(Keys.Settings);
        if (userSettings !== null ) {
            console.log(`User settings loaded: ${userSettings}`);
            userSettings = JSON.parse(userSettings);
            // restore persisted locale
            if(userSettings.curLocale !== userStore.userSettings.curLocale)
                setLocale(userSettings.curLocale);
            userStore.setUserSettings(userSettings);
        }

        // load secure persisted settings
        var lockSettings = await SecureStore.getItemAsync(Keys.LockSettings);
        if( lockSettings !== null ) {
            console.log(`Lock settings loaded: ${lockSettings}`);
            userStore.setLockSettings(JSON.parse(lockSettings));
        } 

        var isTestnet = userStore.userSettings.isTestnet();
        api.setAPI(isTestnet);

        this.setState({
            isLoaded: true,
        });
    }

    onAppStateChanged = (newState) => {
        var lockSettings = stores.userStore.lockSettings;
        var userSettings = stores.userStore.userSettings;
        // console.log(`onAppStateChanged: ${newState}, schedule: ${lockSettings.schedule}`);
        if( newState === 'active' ) {
            switch (lockSettings.schedule)
            {
                case 'onactivate':
                    Actions.jump('lock');
                    return;
                case 'inactiveFor':
                    if(userSettings.lastInactiveTime !== null) {
                        var now =  (new Date()).valueOf();
                        var diff = now - userSettings.lastInactiveTime;
                        var minutes = diff / 1000 / 60;
                        console.log(`App inactive >> minutes: ${minutes}`);
                        if(minutes >= lockSettings.lockAfterMinutes)
                            Actions.jump('lock');
                    }
                    break;
            }
        }
        else {
            userSettings.setInactive();
            // console.log(`Going inactive at ${userSettings.lastInactiveTime}`);
        }
    }

    render() {
        if(!this.state.isLoaded) return (<View/>);
        return (
            <MenuProvider>
                <AppStateMonitor onStateChanged={this.onAppStateChanged}/>
                <StatusBar backgroundColor={Colors.headerBG} barStyle='light-content'/>
                <StyleProvider style={getTheme(appTheme)}>
                    <Provider userStore={stores.userStore}>
                        <Router uriPrefix='exchange.libertaria.world' wrapBy={observer}>
                            <Modal key='root' headerMode="screen">
                                <Scene key='launch' component={Launch} hideNavBar/>
                                <Scene key='firstuse' component={FirstUse} hideNavBar/>
                                <Scene key='welcome' component={Welcome} hideNavBar/>
                                <Scene key='lock' component={LockScreen} hideNavBar/>
                                <Tabs key='app' activeBackgroundColor={Colors.headerBG}
                                      activeTintColor={Colors.plutus}
                                      inactiveTintColor={Colors.headerFG} 
                                      lazy={true} tabBarPosition='bottom'
                                      tabBarComponent={TabBar}>
                                    <Scene key='market' component={Market} hideNavBar/>
                                    <Scene key='trade' component={Trade} hideNavBar/>
                                    <Scene key='wallet' component={Wallet} hideNavBar/>
                                    <Scene key='icos' component={ICOs} hideNavBar/>
                                </Tabs>
                                <Scene key='settings' component={Settings} title={T('common.settings')} hideNavBar/>
                                <Scene key='support' component={Support} title={T('settings.support')} hideNavBar/>
                            </Modal>
                        </Router>
                    </Provider>
                </StyleProvider>
            </MenuProvider>
        );
    }
}

export default observer(App);
