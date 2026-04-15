import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Users (id TEXT PRIMARY KEY, name TEXT, baseCurrency TEXT, email TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS Accounts (id TEXT PRIMARY KEY, userId TEXT, name TEXT, currency TEXT, balance REAL)`);
  db.run(`CREATE TABLE IF NOT EXISTS Transactions (id TEXT PRIMARY KEY, accountId TEXT, amount REAL, type TEXT, category TEXT, timestamp TEXT, description TEXT, targetAccountId TEXT, currency TEXT)`);

  // Seed Data
  db.get("SELECT COUNT(*) as count FROM Transactions", (err, row: any) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO Transactions (id, amount, type, category, timestamp, description, currency) VALUES ('1', 15.0, 'EXPENSE', 'Suscripciones', '2023-10-01', 'Netflix', 'USD')`);
      db.run(`INSERT INTO Transactions (id, amount, type, category, timestamp, description, currency) VALUES ('2', 2500, 'INCOME', 'Salario', '2023-10-02', 'Nómina', 'EUR')`);
      db.run(`INSERT INTO Transactions (id, amount, type, category, timestamp, description, currency) VALUES ('3', 4500, 'EXPENSE', 'Alimentación', '2023-10-03', 'Supermercado', 'ARS')`);
    }
  });
});

// Load contract if available for serving Swagger UI
const contractPath = path.join(__dirname, '..', 'api_contract.json');
if (fs.existsSync(contractPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// ============================================
// ENDPOINTS
// ============================================

app.get('/api/accounts', (req, res) => {
  /* #swagger.tags = ['Accounts']
     #swagger.description = 'Obtener todas las cuentas' */
  db.all('SELECT * FROM Accounts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/accounts', (req, res) => {
  const AccountSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    currency: z.string().min(1),
    balance: z.number()
  });

  try {
    const data = AccountSchema.parse(req.body);
    const id = Date.now().toString();
    const userId = "u1";
    db.run(
      `INSERT INTO Accounts (id, userId, name, currency, balance) VALUES (?, ?, ?, ?, ?)`,
      [id, userId, data.name, data.currency, data.balance],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, userId, ...data });
      }
    );
  } catch (err: any) {
    if (err.errors) return res.status(400).json({ error: "Datos inválidos", details: err.errors });
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/transactions', (req, res) => {
  /* #swagger.tags = ['Transactions']
     #swagger.description = 'Obtener historial de transacciones' */
  db.all('SELECT * FROM Transactions ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  /* #swagger.tags = ['Transactions']
     #swagger.description = 'Registrar una transacción (Gasto, Ingreso o Transferencia)' */
  const TransactionSchema = z.object({
    amount: z.number().positive("El monto debe ser un número positivo."),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'], { errorMap: () => ({ message: "Tipo no válido." }) }),
    category: z.string().min(1, "La categoría es obligatoria."),
    description: z.string().min(1, "La descripción es obligatoria."),
    currency: z.enum(['USD', 'EUR', 'ARS', 'PEN'], { errorMap: () => ({ message: "Moneda no soportada. Use USD, EUR, ARS o PEN." }) }),
    accountId: z.string().min(1, "accountId es obligatorio"),
    targetAccountId: z.string().optional()
  });

  try {
    const data = TransactionSchema.parse(req.body);
    const id = Date.now().toString();
    const ts = new Date().toISOString().split('T')[0];
    
    db.serialize(() => {
      db.run(
        `INSERT INTO Transactions (id, accountId, amount, type, category, timestamp, description, targetAccountId, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.accountId, data.amount, data.type, data.category, ts, data.description, data.targetAccountId || null, data.currency],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          
          if (data.type === 'EXPENSE') {
             db.run(`UPDATE Accounts SET balance = balance - ? WHERE id = ?`, [data.amount, data.accountId]);
          } else if (data.type === 'INCOME') {
             db.run(`UPDATE Accounts SET balance = balance + ? WHERE id = ?`, [data.amount, data.accountId]);
          } else if (data.type === 'TRANSFER' && data.targetAccountId) {
             db.run(`UPDATE Accounts SET balance = balance - ? WHERE id = ?`, [data.amount, data.accountId]);
             db.run(`UPDATE Accounts SET balance = balance + ? WHERE id = ?`, [data.amount, data.targetAccountId]);
          }
          
          res.json({ id, ...data, timestamp: ts });
        }
      );
    });
  } catch (err: any) {
    if (err.errors) {
       return res.status(400).json({ error: "Datos inválidos", details: err.errors });
    }
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/exchange-rates', (req, res) => {
  /* #swagger.tags = ['Rates']
     #swagger.description = 'Obtener cotizaciones en vivo' */
  const base = (req.query.base as string) || 'USD';
  
  const mockRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    ARS: 1050,
    PEN: 3.75
  };

  const baseRate = mockRates[base] || 1;
  const convertedRates: Record<string, number> = {};
  for (const [currency, rate] of Object.entries(mockRates)) {
    if (currency !== base) {
       // Cuánto cuesta 1 unidad de 'currency' en 'base'
       convertedRates[currency] = baseRate / rate;
    }
  }

  res.json({ base, rates: convertedRates, timestamp: new Date().toISOString() });
});

app.get('/api/config', (req, res) => {
  /* #swagger.tags = ['Config']
     #swagger.description = 'Obtener configuración del sistema (moneda base, etc.)' */
  res.json({ baseCurrency: 'USD' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
