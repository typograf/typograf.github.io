'use strict';

const
    path = require('path'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    WebpackMd5Hash = require('webpack-md5-hash'),
    UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = function(env, options) {
    const isProd = options.mode === 'production';

    return {
        watch: true,
        entry: './src/components/index.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'app.min.js'
            //filename: '[name].[chunkhash].js'
        },
        plugins: [
            new CleanWebpackPlugin(['build/']),
            new CopyWebpackPlugin([
                './node_modules/diff/dist/diff.min.js'
            ]),
            new MiniCssExtractPlugin({
                //filename: '[name].[contenthash].css'
                filename: 'app.min.css'
            }),
            new HtmlWebpackPlugin({
                inject: true,
                hash: true,
                template: './src/html/index.html',
                filename: '../index.html'
            }),
            new HtmlWebpackPlugin({
                inject: true,
                hash: true,
                template: './src/html/mobile.html',
                filename: '../mobile.html'
            }),
            new WebpackMd5Hash()
        ],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader'
                    }
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        'less-loader'
                    ]
                }
            ]
        },
        optimization: {
            minimizer: isProd ? [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true
                }),
                new OptimizeCSSAssetsPlugin({})
            ] : undefined
        }
    };
};
