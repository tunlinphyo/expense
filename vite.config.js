import { defineConfig } from "vite"
// import basicSsl from '@vitejs/plugin-basic-ssl'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
    server: {
        host: true,
        historyApiFallback: true,
    },
    plugins: [
        // basicSsl()
        mkcert()
    ],
});
