import path from 'path';
import CopyPlugin from "copy-webpack-plugin";
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export default {
    entry: {
        demo: './demo/demo.js'
    },
    output: {
        path: path.resolve(__dirname, './demoDist'),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: 'demo/index.html', to: 'index.html'},
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /i18n\.xml$/,
                use: ["@green-code-studio/internationalization/i18nWebpackLoader"]
            },
            {
                test: /\.mpts$/,
                use: ["mpts-loader"]
            },{
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]

            },
        ]
    }
}
