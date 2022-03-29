import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const path = require("path");

export default defineConfig({
  plugins: [react()],
  base: "/react-swipeable-wrapper/",
  resolve: {
    alias: {
      "react-swipeable-wrapper": path.resolve(__dirname, "../lib"),
    },
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],
    },
  },
});
