import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../../.env') });

import { Currency } from '@finan/shared';
import { convertCurrency } from './exchangeRate';

async function testConnection() {
    console.log("⏳ Testeando conexión real a ExchangeRate-API con tu Key...");
    console.log("Key Configurada:", process.env.EXCHANGE_RATE_API_KEY ? "SÍ (Oculta)" : "NO");
    
    try {
        const eur = await convertCurrency(1, Currency.USD, Currency.EUR);
        const ars = await convertCurrency(1, Currency.USD, Currency.ARS);
        const pen = await convertCurrency(1, Currency.USD, Currency.PEN);
        
        console.log("\n=== COTIZACIONES EN TIEMPO REAL (Base USD) ===");
        console.log(`💵 1 USD = ${eur} EUR`);
        console.log(`💵 1 USD = ${ars} ARS`);
        console.log(`💵 1 USD = ${pen} PEN`);
        console.log("================================================\n");
        console.log("✅ Conexión exitosa. El Analytics Engine lee la cotización real.");
        process.exit(0);
    } catch(e) {
        console.error("❌ Error al testear:", e);
        process.exit(1);
    }
}

testConnection();
