import { WarrantyService } from "./WarrantyService";
import { serviceBusIntegration } from "../integrations/ServiceBusClient";
import { storageQueueIntegration } from "../integrations/StorageQueueClient";
import { warrantyRepository } from "../repositories/WarrantyRepository";

// Mock dependencies
jest.mock("../integrations/ServiceBusClient", () => ({
    serviceBusIntegration: {
        sendMessage: jest.fn(),
    },
}));

jest.mock("../integrations/StorageQueueClient", () => ({
    storageQueueIntegration: {
        sendMessage: jest.fn(),
    },
}));

jest.mock("../repositories/WarrantyRepository", () => ({
    warrantyRepository: {
        createWarranty: jest.fn(),
    },
}));

describe("WarrantyService", () => {
    let warrantyService: WarrantyService;

    beforeEach(() => {
        jest.clearAllMocks();
        warrantyService = new WarrantyService();
    });

    it("should process warranty claim successfully", async () => {
        const orderID = 123;
        const userID = "user-456";

        await warrantyService.processWarrantyClaim(orderID, userID);

        // Verify Service Bus call
        expect(serviceBusIntegration.sendMessage).toHaveBeenCalledWith({
            orderID,
            userID,
        });

        // Verify Storage Queue success log
        expect(storageQueueIntegration.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "success",
                orderID,
                userID,
            }),
        );

        // Verify Repository call
        expect(warrantyRepository.createWarranty).toHaveBeenCalledWith(
            orderID,
            "Registered",
        );
    });

    it("should handle errors and log to storage queue", async () => {
        const orderID = 789;
        const userID = "user-000";
        const error = new Error("Service Bus failed");

        (serviceBusIntegration.sendMessage as jest.Mock).mockRejectedValueOnce(
            error,
        );

        await expect(
            warrantyService.processWarrantyClaim(orderID, userID),
        ).rejects.toThrow(error);

        // Verify Storage Queue error log
        expect(storageQueueIntegration.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "error",
                message: "Service Bus failed",
                orderID,
                userID,
            }),
        );
    });
});
