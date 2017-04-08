# babel-preset-es2015-node
[![npm version][npm-badge]][npm-href]

> Babel preset for the minimum necessary `babel-preset-es2015` plugins needed for your version of node

This preset automatically determines which version of node you are using via `process.version` and sets the minimum necessary `babel-preset-es2015` plugins accordingly.

All versions of node ≥4 are supported.

*Note: the major version of this package corresponds to the compatible major version of Babel (i.e. use `babel-preset-es2015-node@6` with `babel-cli@6`*.

## Install
```sh
$ npm install --save-dev babel-preset-es2015-node
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "presets": ["es2015-node"]
}
```

### Via CLI

```sh
$ babel script.js --preset es2015-node
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  presets: ["es2015-node"]
});
```

[npm-badge]: https://badge.fury.io/js/babel-preset-es2015-node.svg
[npm-href]: https://www.npmjs.com/package/babel-preset-es2015-node
