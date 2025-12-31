import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            'react-native': 'react-native-web',
        },
    },
    // Essential for resolving .native.js vs .web.js extensions automatically
    optimizeDeps: {
        esbuildOptions: {
            resolveExtensions: ['.web.js', '.js', '.ts', '.tsx', '.jsx'],
        },
    },
});