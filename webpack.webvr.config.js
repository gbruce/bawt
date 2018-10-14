const path = require('path');
const { resolve } = require("path");

module.exports = {
  // context: path.resolve(__dirname, 'src/apps/bawt-webvr'),
  entry: './src/apps/bawt-webvr/index.tsx',
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(glsl|vert|frag)$/,
        loader: "raw-loader",
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
      'bawt': path.resolve(__dirname, 'src/lib/'),
      '*': path.resolve(__dirname, 'src/')
    }
  },
  output: {
    filename: 'bundle.js',
  },
  node: {
    fs: 'empty'
  }
};

console.log(module.exports);
