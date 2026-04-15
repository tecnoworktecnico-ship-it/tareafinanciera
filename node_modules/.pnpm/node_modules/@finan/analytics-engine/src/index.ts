import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../../.env') });

import { Currency, TransactionType } from '@finan/shared';
import { convertCurrency } from './exchangeRate';
import { classifyExpense } from './classifier';

// Config
const apiKey = process.env.EXCHANGE_RATE_API_KEY || '';
const baseCurrency = process.env.DEFAULT_BASE_CURRENCY || 'USD';

console.log(`[Analytics] Started. Base Currency: ${baseCurrency}`);

// Simulación de escucha de nuevas transacciones en background
setInterval(async () => {
    
    const mockExpense = {
        amount: 5000,
        currency: 'ARS',
        description: 'Netflix Mensual'
    };
    
    const category = classifyExpense(mockExpense.description);
    const convertedAmount = await convertCurrency(mockExpense.amount, mockExpense.currency, baseCurrency, apiKey);
    
    console.log(`> Transacción detectada: ${mockExpense.amount} ${mockExpense.currency} (${mockExpense.description})`);
    console.log(`> Categoría Inferida: [${category}]`);
    console.log(`> Conversión normalizada a Base (${baseCurrency}): ${convertedAmount.toFixed(2)} ${baseCurrency}\n`);
    
}, 10000); // Check events every 10 secs
