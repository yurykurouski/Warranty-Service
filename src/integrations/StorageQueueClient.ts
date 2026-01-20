import { QueueClient } from "@azure/storage-queue";
import { config } from "../config/config";

export interface StorageQueueMessage {
    status: "success" | "error";
    message: string;
    orderID?: number;
    userID?: string;
    timestamp: string;
    details?: any;
}

export class StorageQueueIntegration {
    private queueClient: QueueClient | null = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        if (config.storageQueue.connectionString && config.storageQueue.queueName) {
            try {
                this.queueClient = new QueueClient(
                    config.storageQueue.connectionString,
                    config.storageQueue.queueName,
                );
                // Ensure queue exists
                this.queueClient.create().catch((err) => {
                    // Ignore if already exists, log other errors
                    if (err.code !== "QueueAlreadyExists") {
                        console.error(
                            "ERROR: Failed to create/access storage queue:",
                            err.message,
                        );
                    }
                });
            } catch (error) {
                console.error(
                    "ERROR: Failed to initialize Storage Queue Client:",
                    error,
                );
            }
        } else {
            console.warn(
                "WARN: Azure Storage Queue configuration missing. Logging to queue is disabled.",
            );
        }
    }

    public async sendMessage(message: StorageQueueMessage): Promise<void> {
        if (!this.queueClient) {
            console.warn(
                "WARN: Storage Queue client not initialized. Skipping message send.",
            );
            return;
        }

        try {
            // Messages must be base64 encoded for Queue Storage usually, but the SDK handles basic string encoding.
            // Ideally, we send a JSON string.
            const messageString = JSON.stringify({
                ...message,
                message: `[Warranty Service] ${message.message}`,
            });
            // Base64 encode the message as widely expected by Azure Queue Storage consumers (like Function Apps)
            const messageBase64 = Buffer.from(messageString).toString("base64");

            await this.queueClient.sendMessage(messageBase64);
            console.log(
                `Sent log to storage queue: ${message.status} - OrderID: ${message.orderID}`,
            );
        } catch (err) {
            console.error("ERROR: Failed to send message to Storage Queue:", err);
            // We don't throw here to avoid disrupting the main flow just for logging
        }
    }
}

export const storageQueueIntegration = new StorageQueueIntegration();
