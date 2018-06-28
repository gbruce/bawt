const path = require('path');

module.exports = {
  entry: './src/apps/bawt-asset-browser/index.tsx',
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
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
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
    path: path.resolve(__dirname, 'dist')
  },
  node: {
    fs: 'empty'
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  }
};
