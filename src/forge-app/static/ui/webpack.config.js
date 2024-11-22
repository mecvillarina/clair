const { CompiledExtractPlugin } = require('@compiled/webpack-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          { loader: 'babel-loader' },
          {
            // ↓↓ Compiled should run last ↓↓
            loader: '@compiled/webpack-loader',
            options: {
              transformerBabelPlugins: ['@atlaskit/tokens/babel-plugin'],
              extract: true,
              inlineCss: true,
            },
          },
        ],
      },
      {
        test: /compiled-css\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /(?<!compiled-css)(?<!\.compiled)\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CompiledExtractPlugin({ sortShorthand: true }),
  ],
};