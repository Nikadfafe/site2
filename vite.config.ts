import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'ethers'],
                    walletconnect: ['@walletconnect/ethereum-provider', '@walletconnect/modal'],
                },
            },
        },
        chunkSizeWarningLimit: 1000, // Увеличиваем лимит предупреждения до 1000 кБ
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'ethers', '@walletconnect/ethereum-provider', '@walletconnect/modal'],
    },
});
