const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const DashboardPlugin = require('webpack-dashboard/plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');

const isDevServer = process.argv.some(v => v.includes('webpack-dev-server'));

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
      path:
        env === isDevServer
          ? path.resolve(__dirname, 'dist')
          : path.resolve(__dirname),
      filename: env === 'prod' ? 'settings-panel.min.js' : 'settings-panel.js',
      libraryTarget: 'var',
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
    plugins: (env === 'prod'
      ? [new webpack.optimize.ModuleConcatenationPlugin()]
      : [
          new webpack.NamedModulesPlugin(),
          isDevServer
            ? new HtmlWebpackPlugin({
                minify: false,
                template: 'src/index.html',
                inject: 'head',
              })
            : null,
        ])
      .concat([
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(
            process.env.NODE_ENV || 'development',
          ),
        }),

        // new BundleAnalyzerPlugin(),
        // new DashboardPlugin(),
        ...plugins,
      ])
      .filter(p => !!p),
  };
};
