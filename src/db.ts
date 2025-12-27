
import sql from 'mssql';

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // For Azure SQL
        trustServerCertificate: true // Change to false for production
    }
};

export async function createWarranty(orderID: number, status: string): Promise<void> {
    try {
        const pool = await sql.connect(dbConfig);

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
