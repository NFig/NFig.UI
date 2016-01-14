import webpack from 'webpack';
import LessPluginCleanCSS from 'less-plugin-clean-css';

import path from 'path';

import { readFileSync } from 'fs';

const babelOpts = JSON.parse(readFileSync(`${__dirname}/.babelrc`));
const args = process.argv.slice(2);
const defines = {
    'process.env.NODE_ENV': args.indexOf('-p') !== -1 ? '"production"' : '"development"'
};

export default {
    entry: './src',
    output: {
        libraryTarget: 'var',
        library: 'SettingsPanel',
        path: path.join(__dirname, 'dist'),
        filename: 'settings-panel.js',
        publicPath: '/'
    },
    externals: {
    },
    plugins: [
        new webpack.DefinePlugin(defines),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin()
    ],
    module: {
        loaders: [
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.png$/, loader: 'url-loader?mimetype=image/png' },
            { 
                test: /\.js$/, 
                exclude: /node_modules/, 
                loader: 'babel',
                query: babelOpts
            },
            {
                test: /node_modules(\/|\\)qs\1.*\.js$/,
                loader: 'babel',
                query: babelOpts
            }
        ]
    },
    lessLoader: {
        lessPlugins: [
            new LessPluginCleanCSS({advanced: true})
        ]
    }
};
