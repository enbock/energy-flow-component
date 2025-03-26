import {Configuration} from 'webpack';
import path from 'node:path';
import CopyPlugin from 'copy-webpack-plugin';

const config: Configuration & { devServer: any } = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
        library: '@enbock/energy-flow-component',
        libraryTarget: 'umd',
        globalObject: 'this',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
                resolve: {
                    extensions: ['.tsx', '.ts', '.js'],
                    alias: {}
                }
            },
            {
                test: /\.css$/i,
                loader: 'css-loader',
                options: {
                    exportType: 'string',
                    import: false
                }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.svg$/,
                type: 'asset/resource'
            }
        ]
    },
    optimization: {
        minimize: true
    },
    plugins: [],
    resolve: {
        fallback: {
            'typescript': false,
            'process': false
        }
    },
    devServer: {
        port: 3000,
        static: {
            directory: path.join(__dirname, 'public')
        }
    }
};

module.exports = (_: any, argv: any): Configuration => {
    if (argv.mode === 'development') {
        config.devtool = 'inline-source-map';
        config.plugins!.push(
            new CopyPlugin({
                patterns: [
                    {
                        from: 'public'
                    }
                ]
            })
        );
    } else {
        config.plugins!.push(
            new CopyPlugin({
                patterns: [
                    {
                        from: 'package.json'
                    }
                ]
            })
        );
    }
    return config;
};
