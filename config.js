import { Platform, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';

/**
 * Utility
 */

export function isiPhoneX() {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (dimen.height === 812 || dimen.width === 812)
    );
}

export function ifiPhoneX(iphoneXStyle, regularStyle) {
    if (isiPhoneX()) {
        return iphoneXStyle;
    }
    return regularStyle;
}

export function getStatusBarHeight(safe) {
    return Platform.select({
        ios: ifiPhoneX(safe ? 44 : 30, 20),
        android: StatusBar.currentHeight
    });
}

/**
 * Sizes
 */

export const Sizes = {
    navIcon: 24,
    navTabWidth: 100,
    navBarHeight: 60,
    cardCornerRadius: 5,
    statusbarHeight: getStatusBarHeight(false)
}

/**
 * Colors
 */

const plutus = '#CC6F3B';
const select = '#0F72CC'; // blue
const go = '#4f721a'; // green
const stop = '#872929'; // red
const action = '#5487ab' // cyan

export const Colors = {
  libertaria: '#CF9A31',
  plutus: plutus,
  selected: select,
  bodyBG: '#101010',
  bodyFG: '#CCCCCC',
  headerBG: '#202020',
  headerFG: '#808080',
  tabIconDefault: '#808080',
  tabIconSelected: select,
  tabBar: '#202020',
  errorBG: stop,
  errorText: '#fff',
  warningBG: '#EAEB5E',
  warningText: '#666804',
  noticeBG: "#52DFFF",
  noticeText: '#202020',
  buttonBG: action,
  buttonFG: '#202020',
  hintText: '#404040',
  buy: go,
  sell: '#722727',
  action: action,
  import: go,
};

/**
 * Storage Keys
 */

export const Keys = {
  Settings: 'plutus.settings',
  LockSettings: 'plutus.lockSettings',
};
