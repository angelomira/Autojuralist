import type { Configuration } from 'webpack';
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  target: "electron-main", // Указываем цель сборки для процесса main
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [
    new NodePolyfillPlugin(), // Добавляем плагин для обеспечения совместимости с Node.js
    ...plugins,
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};