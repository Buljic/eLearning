const defaultIceServers = [{ urls: 'stun:stun.l.google.com:19302' }];

const parseIceServers = () => {
    const rawIceServers = import.meta.env.VITE_ICE_SERVERS;
    if (!rawIceServers) {
        return defaultIceServers;
    }

    try {
        const parsed = JSON.parse(rawIceServers);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultIceServers;
    } catch (error) {
        console.error('Invalid VITE_ICE_SERVERS value, using default STUN server.', error);
        return defaultIceServers;
    }
};

const config = {
    local: {
        BASE_URL: 'http://localhost:8080',
        WS_BASE_URL: 'http://localhost:5173',
        ICE_SERVERS: parseIceServers(),
    },
    lan: {
        BASE_URL: 'http://192.168.126.66:8080',
        WS_BASE_URL: 'http://192.168.126.66:5173',
        ICE_SERVERS: parseIceServers(),
    },
};

const ENV = import.meta.env.VITE_APP_ENV || 'local';
export default config[ENV];

