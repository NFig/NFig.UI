import webpack from 'webpack';
import LessPluginCleanCSS from 'less-plugin-clean-css';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

const config = {
    entry: [
        'webpack-hot-middleware/client',
        './src'
    ],
    output: {
        libraryTarget: 'var',
        library: 'SettingsPanel',
        path: path.join(__dirname, 'dist'),
        filename: 'settings-panel.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
    ],
    module: {
        loaders: [
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.png$/, loader: 'url?mimetype=image/png' },
            { test: /\.gif/, loader: 'url?mimetype=image/gif' },
            {
                test: /\.jsx?$/,
                include: path.join(__dirname, 'src'),
                loader: 'babel'
            },
            {
                test: /node_modules(\/|\\)qs\1.*\.js$/,
                loader: 'babel'
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    lessLoader: {
        lessPlugins: [
            new LessPluginCleanCSS({advanced: true})
        ]
    }
};

if (env === 'production'){
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    );
}

export default config;

