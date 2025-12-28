import { serviceBusIntegration, WarrantyMessage } from "../integrations/ServiceBusClient";
import { warrantyRepository } from "../repositories/WarrantyRepository";

export class WarrantyService {
    public async processWarrantyClaim(orderID: number, userID: string): Promise<void> {
        // Here we can decide the order of operations. 
        // The original code tried to send message first, then create DB record.
        // It also allowed DB record creation failure to not stop the response? 
        // Actually, the original code sent response, THEN created DB record asynchronously without awaiting it in the HTTP handler.
        // Ideally we should make this consistent. If one fails, what happens?
        // For this refactor, I will keep the optimistic approach but arguably we should await both or handle failure better.
        // Let's await both to fail fast if something is wrong, ensuring data consistency is a bigger topic.

        // Step 1: Send message to Service Bus
        await serviceBusIntegration.sendMessage({ orderID, userID });

        // Step 2: Create DB record
        // In the original code, this was "fire and forget" or at least "don't block response".
        // But throwing here was possible.
        // Let's make it part of the flow.
        await warrantyRepository.createWarranty(orderID, 'Registered');
    }
}

export const warrantyService = new WarrantyService();
