import { defineConfig } from "vite";
import { iwsdkDev } from "@iwsdk/vite-plugin-dev";

export default defineConfig({
  plugins: [iwsdkDev()],
  resolve: {
    dedupe: ["elics", "@iwsdk/core", "three"]
  }
});
