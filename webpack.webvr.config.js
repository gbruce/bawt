const path = require('path');
const { resolve } = require("path");

module.exports = {
  // context: path.resolve(__dirname, 'src/apps/bawt-webvr'),
  entry: {
    app: './src/apps/bawt-webvr/index.ts',
    worker: './src/lib/worker/Worker.ts'
  },
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
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader?inline=true' }
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
      'bawt': path.resolve(__dirname, 'src/lib/'),
      'interface': path.resolve(__dirname, 'src/interface/'),
      '*': path.resolve(__dirname, 'src/')
    }
  },
  output: {
    filename: '[name].js',
  },
  node: {
    fs: 'empty'
  }
};

console.log(module.exports);
