const dotenv = require("dotenv")
const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const { EnvironmentPlugin } = require("webpack")

dotenv.config({
  path: path.join(__dirname, ".env")
})

module.exports = {
  target: "node",
  output: {
    path: path.resolve(__dirname, "contracts/dist"),
    libraryExport: "default",
    libraryTarget: "commonjs-module",
    filename: "[name].js",
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new EnvironmentPlugin(["ACCOUNT_ID", "HORIZON_URL"])
  ],
}
