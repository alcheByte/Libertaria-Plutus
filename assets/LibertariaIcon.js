import { createIconSet } from 'react-native-vector-icons';

const glyphMap = {
  "chart": 57345, // E001
  "attention": 57346, // E002
  "wallet": 57347, // E003
  "basket": 57348, // E004
  "trade": 57349, // E005
  "orderbook": 57350, // E006
  "minus": 57351, //E00B7
  "plus": 57352, // E008
  "atprice": 57353, // E009
  "max": 57354, // E00A
  "qrcode": 57355, // E00B
  "rocket": 57356, // E00C
  "settings": 57357, // EOOD
  "minus-button-round": 57358, // EOOE
  "close-button-round": 57359, // EOOF
  "close-button-square": 57360, // EO10
  "paste": 57361, // EO11
  "go": 57362, // EO12
  //  test: '∆'
}

export const LibertariaIcon = createIconSet(glyphMap, 'libertaria', require('../assets/fonts/libertaria.ttf'));

export const Button = LibertariaIcon.Button;
export const TabBarItem = LibertariaIcon.TabBarItem;
export const TabBarItemIOS = LibertariaIcon.TabBarItemIOS;
export const ToolbarAndroid = LibertariaIcon.ToolbarAndroid;
export const getImageSource = LibertariaIcon.getImageSource;