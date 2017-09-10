const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const DashboardPlugin = require('webpack-dashboard/plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = env => {
  const plugins =
    env === 'prod'
      ? [
          new BabelMinifyPlugin(undefined, {
            comments: false,
          }),
        ]
      : [];

  return {
    entry: './src',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: env === 'prod' ? 'settings-panel.min.js' : 'settings-panel.js',
      library: 'NFigUI',
    },
    devServer: {
      https: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: ['babel-loader', 'ts-loader'],
        },
      ],
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    plugins: [
      // new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.NamedModulesPlugin(),
      new HtmlWebpackPlugin({
        minify: false,
        template: 'src/index.html',
        inject: 'head',
      }),

      // new BundleAnalyzerPlugin(),
      // new DashboardPlugin(),
      ...plugins,
    ],
  };
};
