import path from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import tsconfigPaths from "vite-tsconfig-paths"

function resolve(str: string) {
  return path.resolve(__dirname, str)
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve("./src/index.ts"),
      },
      fileName: (format, entryName) => {
        if (format === "es") {
          return `${entryName}.js`
        }
        return `${entryName}.${format}`
      },
      formats: ["es", "cjs"],
    },
  },
  plugins: [
    dts({
      exclude: ["**/*.test.ts"],
    }),
    tsconfigPaths(),
  ],
})
