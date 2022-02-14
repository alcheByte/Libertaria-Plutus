import ReactNative from 'react-native';
import I18n from 'ex-react-native-i18n';

// Import all locales
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
// import fr from './locales/fr.json';
// import hi from './locales/hi.json';
import hr from './locales/hr.json';
import hu from './locales/hu.json';
// import id from './locales/id.json';
import it from './locales/it.json';
// import ja from './locales/ja.json';
// import ko from './locales/ko.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
// import sr from './locales/sr.json';
import tr from './locales/tr.json';
import uk from './locales/uk.json';
import ur from './locales/ur.json';
// import zh from './locales/zh.json';

// define list of supported locales
export const SupportedLocales = [{
    code: "de",
    lang: "German",
  },
  {
    code: "en",
    lang: "English",
  },
  {
    code: "es",
    lang: "Spanish",
  },
  // {
  //   code: "fr",
  //   lang: "French",
  // },
  // {
  //   code: "hi",
  //   lang: "Hindi",
  // },
  {
    code: "hr",
    lang: "Croatian",
  },
  {
    code: "hu",
    lang: "Hungarian",
  },
  // {
  //   code: "id",
  //   lang: "Indonesian",
  // },
  {
    code: "it",
    lang: "Italian",
  },
  // {
  //   code: "ja",
  //   lang: "Japanese",
  // },
  // {
  //   code: "ko",
  //   lang: "Korean",
  // },
  {
    code: "nl",
    lang: "Dutch",
  },
  {
    code: "pl",
    lang: "Polish",
  },
  {
    code: "pt",
    lang: "Portuguese",
  },
  {
    code: "ru",
    lang: "Russian",
  },
  // {
  //   code: "sr",
  //   lang: "Serbian",
  // },
  {
    code: "tr",
    lang: "Turkish",
  },
  {
    code: "uk",
    lang: "Ukrainian",
  },
  {
    code: "ur",
    lang: "Urdu",
  },
  // {
  //   code: "zh",
  //   lang: "Chinese",
  // },
];

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported translations
// I18n.translations = SupportedLocales.map((loc) => {loc.lang, loc.translation});
I18n.translations = {
  en,
  de,
  es,
  hr,
  hu,
  it,
  nl,
  pl,
  pt,
  ru,
  tr,
  uk,
  ur,
}

// Is it a RTL language?
// export function isRTL = I18n.currentLocale().indexOf('he') === 0 || currentLocale.indexOf('ar') === 0;

// // Allow RTL alignment in RTL languages
// ReactNative.I18nManager.allowRTL(isRTL);

// export function availableLocales() {
//   return _Localizer.getAvailableLanguages();
// }

export function setLocale(code) {
  return I18n.locale = code;
}

export function getLocale() {
  return I18n.currentLocale();
}

// export function getDeviceLocale() {
//   return _Localizer.getInterfaceLanguage();
// }

// The method we'll use instead of a regular string
export function T(name, params = {}) {
  return I18n.t(name, params);
};


