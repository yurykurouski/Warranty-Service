const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Warranty Service API',
        description: 'API for managing warranty claims'
    },
    host: 'localhost:3000',
    schemes: ['http']
};

const fs = require('fs');
const path = require('path');

const outputFile = './src/generated/swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

// Ensure directory exists
const dir = path.dirname(outputFile);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger documentation has been generated');
});
