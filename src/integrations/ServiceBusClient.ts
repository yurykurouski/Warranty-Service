import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";
import { config } from "../config/config";

export interface WarrantyMessage {
    orderID: number;
    userID: string;
}

export class ServiceBusIntegration {
    private sbClient: ServiceBusClient | null = null;
    private sender: ServiceBusSender | null = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        if (config.serviceBus.connectionString && config.serviceBus.queueName) {
            this.sbClient = new ServiceBusClient(config.serviceBus.connectionString);
            this.sender = this.sbClient.createSender(config.serviceBus.queueName);
        } else {
            console.error("ERROR: Azure Service Bus configuration missing. Messages cannot be sent.");
        }
    }

    public async sendMessage(message: WarrantyMessage): Promise<void> {
        if (!this.sender) {
            throw new Error("ERROR: Service Bus sender is not initialized. Cannot send message.");
        }

        try {
            await this.sender.sendMessages({
                body: message,
                contentType: "application/json",
                replyTo: config.serviceBus.queueName,
                subject: "WarrantyRequest"
            });
            console.log(`Sent message to queue: ${JSON.stringify(message)} with replyTo: ${config.serviceBus.queueName}`);
        } catch (err) {
            console.error("ERROR: Failed to send message to Service Bus:", err);
            throw err;
        }
    }

    public async close(): Promise<void> {
        if (this.sender) await this.sender.close();
        if (this.sbClient) await this.sbClient.close();
    }
}

export const serviceBusIntegration = new ServiceBusIntegration();
