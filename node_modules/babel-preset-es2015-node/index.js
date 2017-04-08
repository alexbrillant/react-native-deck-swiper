var semver = require("semver");

var pluginsList = [
  require("babel-plugin-transform-es2015-modules-commonjs")
];

if (semver.lt(process.version, '6.0.0')) {
  pluginsList.push(
    require("babel-plugin-transform-es2015-destructuring"),
    require("babel-plugin-transform-es2015-function-name"),
    require("babel-plugin-transform-es2015-parameters"),
    require("babel-plugin-transform-es2015-shorthand-properties"),
    require("babel-plugin-transform-es2015-sticky-regex"),
    require("babel-plugin-transform-es2015-unicode-regex"));
}

if (semver.lt(process.version, '5.0.0')) {
  pluginsList.push(require("babel-plugin-transform-es2015-spread"));
}

module.exports = {
  plugins: pluginsList
};
