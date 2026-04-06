/**
 * Polyfill for util.styleText which was added in Node 21.7.0.
 * This is required for React Native CLI 0.84.1 to run on older Node 21.x versions.
 */
const util = require('util');
if (!util.styleText) {
  util.styleText = (style, text) => {
    // Basic ANSI color mapping for fallback
    const styles = {
      'grey': '\x1b[90m',
      'bold': '\x1b[1m',
      'red': '\x1b[31m',
      'green': '\x1b[32m',
      'yellow': '\x1b[33m',
      'blue': '\x1b[34m',
      'magenta': '\x1b[35m',
      'cyan': '\x1b[36m',
      'white': '\x1b[37m',
      'reset': '\x1b[0m'
    };
    
    let result = text;
    if (Array.isArray(style)) {
      style.forEach(s => {
        if (styles[s]) result = styles[s] + result + styles.reset;
      });
    } else if (styles[style]) {
      result = styles[style] + result + styles.reset;
    }
    return result;
  };
}
