import sql from 'mssql';
import { config } from '../config/config';

export class WarrantyRepository {
    private pool: sql.ConnectionPool | null = null;

    private async getPool(): Promise<sql.ConnectionPool> {
        if (this.pool) return this.pool;
        try {
            this.pool = await sql.connect(config.db);
            return this.pool;
        } catch (err) {
            console.error('ERROR: Failed to connect to database', err);
            throw err;
        }
    }

    public async createWarranty(orderID: number, status: string): Promise<void> {
        try {
            const pool = await this.getPool();

            await pool.request()
                .input('orderID', sql.Int, orderID)
                .input('status', sql.NVarChar, status)
                .query(`INSERT INTO Warranty (orderID, status) VALUES (@orderID, @status)`);

            console.log(`Warranty created for Order ID: ${orderID} with status: ${status}`);
        } catch (err) {
            console.error('ERROR: Failed to create warranty record:', err);
            throw err;
        }
    }
}

export const warrantyRepository = new WarrantyRepository();
