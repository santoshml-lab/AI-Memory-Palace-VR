import { iwsdkDev } from "@iwsdk/vite-plugin-dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [iwsdkDev()]
});
