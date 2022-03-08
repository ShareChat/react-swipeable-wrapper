import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const path = require("path");

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/index.js"),
      name: "react-swipeable-wrapper",
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react", "react-dom"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "react",
          "react-dom": "react-dom",
        },
      },
    },
  },
});
