// src/config.js
const config = {
    local: {
        BASE_URL: 'http://localhost:8080',
        WS_BASE_URL: 'http://localhost:5173'
    },
    lan: {
        BASE_URL: 'http://192.168.0.11:8080',
        WS_BASE_URL: 'http://192.168.0.11:5173'
    },
};

const ENV = import.meta.env.VITE_APP_ENV || 'local';  // Default to 'local' if not set
export default config[ENV];

