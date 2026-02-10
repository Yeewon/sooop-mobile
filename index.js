/**
 * @format
 */

// Polyfill TextDecoder/TextEncoder for Supabase Realtime (Hermes lacks these)
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class {
    decode(input) {
      if (!input) return '';
      const bytes = new Uint8Array(input);
      const chunks = [];
      for (let i = 0; i < bytes.length; ) {
        const b = bytes[i];
        let code;
        if (b < 0x80) { code = b; i += 1; }
        else if (b < 0xe0) { code = ((b & 0x1f) << 6) | (bytes[i+1] & 0x3f); i += 2; }
        else if (b < 0xf0) { code = ((b & 0x0f) << 12) | ((bytes[i+1] & 0x3f) << 6) | (bytes[i+2] & 0x3f); i += 3; }
        else { code = ((b & 0x07) << 18) | ((bytes[i+1] & 0x3f) << 12) | ((bytes[i+2] & 0x3f) << 6) | (bytes[i+3] & 0x3f); i += 4; }
        chunks.push(String.fromCodePoint(code));
      }
      return chunks.join('');
    }
  };
}
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class {
    encode(str) {
      const buf = [];
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 0x80) buf.push(c);
        else if (c < 0x800) { buf.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
        else if (c < 0xd800 || c >= 0xe000) { buf.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
        else { c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(++i) & 0x3ff)); buf.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
      }
      return new Uint8Array(buf);
    }
  };
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
