const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    app: './js/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/app.js',
  },
  module: {
    rules: [
      // OpenLayers 등의 CSS를 JS에서 import 할 수 있게 한다.
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    // .env 값을 빌드 시 process.env.* 로 주입한다. (.env 없어도 빌드는 진행)
    new Dotenv({ systemvars: true }),
  ],
};
