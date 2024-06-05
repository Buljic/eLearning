// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
//
// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   define:{
//     global:'globalThis'
//   }
// })
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills()
  ],
  optimizeDeps: {
    exclude: ['@esbuild-plugins/node-globals-polyfill']
  },
  resolve: {
    alias: {
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
      timers: 'timers-browserify'
    }
  },
  //todo izbrisi kad ti bude trebalo
  server: {
    host: '192.168.0.11',  // Replace with your main laptop's IP address
    port: 5173            // Ensure this matches the port you're using for Vite
  }
});


