
interface FireblocksConfig {
    apiKey: string;
    apiSecretKey: string;
    baseUrl: string;
}

const getFireblocksConfig = (): FireblocksConfig => {
    console.log('111'+Bun.env.FIREBLOCKS_API_SECRET_KEY)
    return {
        apiKey: Bun.env.FIREBLOCKS_API_KEY || '',
        apiSecretKey: Bun.env.FIREBLOCKS_API_SECRET_KEY || '',
        baseUrl: Bun.env.FIREBLOCKS_BASE_URL || '',
    };
};

const fireblocksConfig = getFireblocksConfig();

export default fireblocksConfig;