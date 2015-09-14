var webpack = require('webpack');

module.exports = {
  entry: './src/settings-panel.jsx',
  output: {
    libraryTarget: 'var',
    library: 'SettingsPanel',
    path: './dist',
    filename: 'settings-panel.js'
  },
  externals: {
    react: 'React'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style!raw!less' },
      { test: /\.jsx?$/, exclude: /(node_modules|bower_components)/, loader: 'babel' }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      'fetch': 'imports?self=>global!exports?global.fetch!whatwg-fetch'
    })
  ]
};
