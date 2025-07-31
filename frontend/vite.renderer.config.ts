import { defineConfig } from "vite";
// @ts-expect-error Typescript can't find module or type declaration
import tailwindcss from "@tailwindcss/postcss";
import autofixer from "autoprefixer";

// https://vitejs.dev/config
export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss(), autofixer],
    },
  },
});
