'use strict';

const
    path = require('path'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    WebpackMd5Hash = require('webpack-md5-hash'),
    TerserPlugin = require('terser-webpack-plugin'),    
    //CopyWebpackPlugin = require('copy-webpack-plugin'),
    OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
    { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = function(env, options) {
    const isProd = options.mode === 'production';

    return {
        watch: false,
        entry: {
            desktop: './src/js/app.desktop.js',
            mobile: './src/js/app.mobile.js'
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: '[name].min.js'
        },
        plugins: [
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].min.css'
            }),
            new HtmlWebpackPlugin({
                inject: true,
                hash: true,
                chunks: [ 'desktop' ],
                template: './src/html/index.html',
                filename: '../index.html'
            }),
            new HtmlWebpackPlugin({
                inject: true,
                hash: true,
                chunks: [ 'mobile' ],
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
            minimize: isProd,
            minimizer: [
                new TerserPlugin(),
                new OptimizeCSSAssetsPlugin({})                        
            ],
        },
    };
};
