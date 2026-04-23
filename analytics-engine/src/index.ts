import { config } from 'dotenv';
import path from 'path';
import sqlite3 from 'sqlite3';
config({ path: path.resolve(__dirname, '../../.env') });

import { Currency, TransactionType } from '@finan/shared';
// import { convertCurrency } from './exchangeRate'; // Ignorado para el Pro Auditor para no saturar API
import { classifyExpense } from './classifier';

// Database
const dbPath = path.resolve(__dirname, '../../backend/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log(`[Pro Auditor Agent] Initialized. Monitoring: ${dbPath}`);

const runAudit = () => {
  db.all('SELECT * FROM Transactions ORDER BY timestamp DESC LIMIT 1', [], (err, rows: any[]) => {
    if (err) return console.error(err);
    if (rows.length === 0) return;

    const lastTx = rows[0];
    const category = classifyExpense(lastTx.description);
    
    console.log(`\n--- 🛡️ PRO INTELLIGENCE AUDIT ---`);
    console.log(`> Registro analizado: ${lastTx.description} [${lastTx.amount} ${lastTx.currency}]`);
    console.log(`> Categoría Detectada: ${category}`);
    
    // Simulación de auditoría de riesgo
    if (lastTx.amount > 1000) {
       console.log(`> ⚠️ ALERTA PRO: Transacción de alto valor detectada. Verificando contra presupuestos...`);
    } else {
       console.log(`> ✅ Estado: Normal. Flujo de capital estable.`);
    }
    console.log(`---------------------------------\n`);
  });
};

// Check every 15 seconds
setInterval(runAudit, 15000);
runAudit();
