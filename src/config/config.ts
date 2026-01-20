import "dotenv/config";

interface DbConfig {
    user?: string;
    password?: string;
    server: string;
    database?: string;
    options: {
        encrypt: boolean;
        trustServerCertificate: boolean;
    };
}

interface ServiceBusConfig {
    connectionString?: string;
    queueName?: string;
}

interface StorageQueueConfig {
    connectionString?: string;
    queueName?: string;
}

class Config {
    public readonly port: number;
    public readonly db: DbConfig;
    public readonly serviceBus: ServiceBusConfig;
    public readonly storageQueue: StorageQueueConfig;

    constructor() {
        this.port = Number(process.env.PORT) || 3000;

        this.db = {
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            server: process.env.DB_SERVER || "localhost",
            database: process.env.DB_NAME,
            options: {
                encrypt: true, // For Azure SQL
                trustServerCertificate: true, // Change to false for production
            },
        };

        this.serviceBus = {
            connectionString:
                process.env.SERVICE_BUS_CONNECTION_STRING_WRITE?.replace(/^"|"$/g, ""),
            queueName: process.env.QUEUE_NAME?.replace(/^"|"$/g, ""),
        };

        this.storageQueue = {
            connectionString: process.env.STORAGE_ACCOUNT_CONNECTION_STRING?.replace(
                /^"|"$/g,
                "",
            ),
            queueName: process.env.STORAGE_QUEUE_NAME?.replace(/^"|"$/g, ""),
        };
    }
}

export const config = new Config();
