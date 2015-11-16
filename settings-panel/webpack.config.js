var webpack = require('webpack');
var LessPluginCleanCSS = require('less-plugin-clean-css');

module.exports = {
  entry: './src/SettingsPanel.js',
  output: {
    libraryTarget: 'var',
    library: 'SettingsPanel',
    path: './dist',
    filename: 'settings-panel.js'
  },
  externals: {
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.png$/, loader: 'url-loader?mimetype=image/png' },
      { test: /\.js$/, exclude: /(node_modules|bower_components)/, loader: 'babel' }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      fetch: 'imports?self=>global!exports?global.fetch!whatwg-fetch'
    })
  ],
  lessLoader: {
    lessPlugins: [
      new LessPluginCleanCSS({advanced: true})
    ]
  }
};
