const path = require("path");
const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const NODE_ENV = process.env.NODE_ENV;

module.exports = {
  stats: "errors-only", //控制台只输出错误信息
  entry: path.resolve(__dirname, "../src/app.tsx"),
  output: {
    filename: "[name].[contenthash:8].js",
    path: path.resolve(__dirname, "../dist"),
    clean: true, //在每次构建前将清空输出目录
    libraryTarget: "umd", //指定打包生成的库的输出格式, "umd" 允许你的库在 CommonJS、AMD 和全局变量（Global Variable）等多种环境中使用
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  devServer: {
    hot: true, // 热更新
    open: true, // 编译完自动打开浏览器
    compress: false, // 关闭gzip压缩
    port: 3000, // 开启端口号
    historyApiFallback: true, // 支持 history 路由重定向到 index.html 文件
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/, // 排除node_modules目录
        use: {
          loader: "babel-loader", // 使用babel-loader处理js文件
        },
      },
      {
        test: /\.tsx?$/i, // 匹配所有.tsx和.ts文件
        exclude: /node_modules/, // 排除node_modules目录
        use: {
          loader: "ts-loader", // 使用ts-loader处理.tsx和.ts文件
        },
      },
      {
        test: /\.(jpe?g|gif|png|svg|bmp|webp)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, //低于这个大小的图片资源将转为base64
          },
        },
        generator: {
          filename: "assets/images/[name].[contenthash:8][ext]",
        },
      },
      { ...getCssRule("css") },
      { ...getCssRule("less") },
      { ...getCssRule("sass") },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      // 定义在代码中可以替换的一些常量
      process: {
        env: {
          __DEV__: NODE_ENV === "development",
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html", // 模板文件路径
      filename: "index.html", // 输出文件名
    }),
    new MiniCssExtractPlugin({
      filename: "assets/css/[name].[contenthash:8].css",
    }),
    new WebpackBar({
      color: "#0557ff", // 默认green，进度条颜色支持HEX
      basic: false, // 默认true，启用一个简单的日志报告器
      profile: false, // 默认false，启用探查器。
    }),
    NODE_ENV === "production" && new CompressionPlugin({
      // gzip压缩
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.(js|css)$/,
      threshold: 10 * 1024, // 文件大小大于 10KB才会被压缩
      minRatio: 0.8, // 压缩比例达到 0.8 以上才会被压缩
    })
  ],
};

/**
 * 样式处理规则
 * @param {string} loader ('css'|'less'|'sass')
 */
function getCssRule(loader) {
  let styleLoader = process.env.NODE_ENV === "production" ? MiniCssExtractPlugin.loader : 'style-loader';
  const loaders = [
    styleLoader,
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [["autoprefixer"]],
        },
      },
    },
  ];

  if (loader === "css") {
    return {
      test: /\.css$/i,
      use: loaders,
    };
  }

  if (loader === "less") {
    return {
      test: /\.less$/i,
      use: [...loaders, "less-loader"],
    };
  }

  if (loader === "sass") {
    return {
      test: /\.(sass|scss)$/i,
      use: [...loaders, "sass-loader"],
    };
  }
  return {};
}
