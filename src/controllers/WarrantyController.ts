import { Body, Controller, Put, Route, SuccessResponse, Response } from "tsoa";
import { warrantyService } from "../services/WarrantyService";

export interface WarrantyClaimRequest {
    /**
     * The ID of the order
     * @isInt
     */
    orderID: number;
    /**
     * The ID of the user requesting the warranty
     */
    userID: string;
}

interface ErrorResponse {
    error: string;
}

interface SuccessData {
    message: string;
    data: WarrantyClaimRequest;
}

@Route("api/warranty-claim")
export class WarrantyController extends Controller {
    /**
     * Submit a new warranty claim
     * @param requestBody The warranty claim details
     */
    @Put()
    @Response<ErrorResponse>(400, "Bad Request")
    @Response<ErrorResponse>(500, "Internal Server Error")
    @Response<ErrorResponse>(504, "Gateway Timeout")
    @SuccessResponse("200", "Created")
    public async createClaim(
        @Body() requestBody: WarrantyClaimRequest,
    ): Promise<SuccessData> {
        const { orderID, userID } = requestBody;

        console.log(
            `Received warranty claim for Order: ${orderID}, User: ${userID}`,
        );

        try {
            await warrantyService.processWarrantyClaim(orderID, userID);

            return {
                message: "Warranty claim processed successfully",
                data: { orderID, userID },
            };
        } catch (error: unknown) {
            console.error("Error processing warranty claim:", error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            if (errorMessage === "Timeout waiting for warranty confirmation") {
                this.setStatus(504);
                throw { error: "Gateway Timeout: No confirmation received" };
            } else {
                this.setStatus(500);
                throw { error: "Internal Server Error" };
            }
        }
    }
}

export const warrantyController = new WarrantyController();
