import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING_WRITE?.replace(/^"|"$/g, '');
const queueName = process.env.QUEUE_NAME?.replace(/^"|"$/g, '');

let sbClient: ServiceBusClient | null = null;
let sender: ServiceBusSender | null = null;

if (connectionString && queueName) {
    sbClient = new ServiceBusClient(connectionString);
    sender = sbClient.createSender(queueName);
} else {
    console.error("ERROR: Azure Service Bus configuration missing. Messages cannot be sent.");
}

interface WarrantyMessage {
    orderID: number;
    userID: number;
}

export async function sendMessage(message: WarrantyMessage): Promise<void> {
    if (!sender) {
        throw new Error("ERROR: Service Bus sender is not initialized. Cannot send message.");
    }

    try {
        await sender.sendMessages({
            body: message,
            contentType: "application/json",
            replyTo: queueName,
            subject: "WarrantyRequest"
        });
        console.log(`Sent message to queue: ${JSON.stringify(message)} with replyTo: ${queueName}`);
    } catch (err) {
        console.error("ERROR: Failed to send message to Service Bus:", err);
        throw err;
    }
}

