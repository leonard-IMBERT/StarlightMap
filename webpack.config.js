module.exports = {
  entry: {
    front: './src/front/front.ts',
  },
  mode: 'development',
  output: {
    filename: './script.[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.tsx?$/, loaders: ['babel-loader', 'ts-loader'], exclude: /node_modules/ },
    ],
  },
};
