import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/blitzware-vue-sdk.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/blitzware-vue-sdk.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/blitzware-vue-sdk.umd.js",
      format: "umd",
      name: "BlitzWareVueSDK",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      browser: true,
    }),
    ,
    commonjs(),
    typescript(),
    terser(),
  ],
  external: ["vue", "vue-router", "axios", "buffer"],
};
