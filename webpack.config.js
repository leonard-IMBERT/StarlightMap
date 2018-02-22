module.exports = {
  entry: {
    front: './src/front/front.js'
  },
  output: {
    filename: './compile/script.[name].js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
}
