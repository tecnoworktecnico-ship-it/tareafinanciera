const swaggerAutogen = require('swagger-autogen')();
const path = require('path');

const doc = {
  info: {
    title: 'Smart Expense Tracker Multi-Moneda API',
    description: 'API Contract para el backend del sistema',
    version: '1.0.0'
  },
  host: 'localhost:3001',
  schemes: ['http'],
};

const outputFile = path.join(__dirname, '..', 'api_contract.json');
const endpointsFiles = [path.join(__dirname, 'index.ts')];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('api_contract.json generado exitosamente.');
});
