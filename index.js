const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Warranty Service API',
      version: '1.0.0',
      description: 'API for managing warranty claims',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/warranty-claim:
 *   put:
 *     summary: Submit a warranty claim
 *     description: Processes a warranty claim using orderID and userID
 *     tags: [Warranty]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderID
 *               - userID
 *             properties:
 *               orderID:
 *                 type: integer
 *                 description: The ID of the order
 *               userID:
 *                 type: integer
 *                 description: The ID of the user
 *     responses:
 *       200:
 *         description: Warranty claim processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderID:
 *                       type: integer
 *                     userID:
 *                       type: integer
 *       400:
 *         description: Invalid input
 */
app.put('/api/warranty-claim', (req, res) => {
  const { orderID, userID } = req.body;

  // Validate that both parameters are present and are integers
  if (!Number.isInteger(orderID) || !Number.isInteger(userID)) {
    return res.status(400).json({ error: 'orderID and userID must be integers' });
  }

  // TODO: Add database logic here
  console.log(`Received warranty claim for Order: ${orderID}, User: ${userID}`);

  res.status(200).json({
    message: 'Warranty claim processed successfully',
    data: { orderID, userID }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API URL: http://localhost:${port}/api/warranty-claim`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});
