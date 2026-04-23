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

let ratesCache: { rates: Record<string, number>, timestamp: number } | null = null;
const CACHE_DURATION = 3600000; // 1 hour

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Categories (id TEXT PRIMARY KEY, name TEXT)`);
  
  db.run(`CREATE TABLE IF NOT EXISTS Transactions (
    id TEXT PRIMARY KEY,
    accountId TEXT,
    amount REAL,
    type TEXT,
    category TEXT,
    timestamp TEXT,
    description TEXT,
    targetAccountId TEXT,
    currency TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Accounts (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT,
    currency TEXT,
    balance REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Budgets (
    id TEXT PRIMARY KEY,
    category TEXT,
    limitAmount REAL,
    currency TEXT,
    month TEXT
  )`);

  // Seed Data
  db.get("SELECT COUNT(*) as count FROM Categories", (err, row: any) => {
    if (row && row.count === 0) {
      const defaultCats = ['Alimentación', 'Salario', 'Suscripciones', 'Transporte', 'Salud', 'Hogar', 'Ocio', 'Inversiones'];
      defaultCats.forEach((cat, idx) => {
        db.run(`INSERT INTO Categories (id, name) VALUES (?, ?)`, [idx.toString(), cat]);
      });
    }
  });

  db.get("SELECT COUNT(*) as count FROM Transactions", (err, row: any) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO Transactions (id, amount, type, category, timestamp, description, currency) VALUES ('1', 15750.0, 'EXPENSE', 'Suscripciones', '2023-10-01', 'Netflix', 'ARS')`);
      db.run(`INSERT INTO Transactions (id, amount, type, category, timestamp, description, currency) VALUES ('2', 2625000.0, 'INCOME', 'Salario', '2023-10-02', 'Nómina', 'ARS')`);
      db.run(`INSERT INTO Transactions (id, amount, type, category, timestamp, description, currency) VALUES ('3', 4500, 'EXPENSE', 'Alimentación', '2023-10-03', 'Supermercado', 'ARS')`);
    }
  });

  db.get("SELECT COUNT(*) as count FROM Budgets", (err, row: any) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO Budgets (id, category, limitAmount, currency, month) VALUES ('b1', 'Alimentación', 525000, 'ARS', '2023-10')`);
      db.run(`INSERT INTO Budgets (id, category, limitAmount, currency, month) VALUES ('b2', 'Suscripciones', 52500, 'ARS', '2023-10')`);
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

app.patch('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  const { name, currency, balance } = req.body;
  db.run(
    `UPDATE Accounts SET name = ?, currency = ?, balance = ? WHERE id = ?`,
    [name, currency, balance, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: true });
    }
  );
});

app.delete('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  // Optional: check if there are transactions first
  db.get('SELECT COUNT(*) as count FROM Transactions WHERE accountId = ?', [id], (err, row: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count > 0) {
      return res.status(400).json({ error: "No se puede eliminar una cuenta con transacciones activas. Elimina primero las transacciones." });
    }
    db.run('DELETE FROM Accounts WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: true });
    });
  });
});

app.get('/api/transactions', (req, res) => {
  /* #swagger.tags = ['Transactions']
     #swagger.description = 'Obtener historial de transacciones con paginación opcional' */
  const { page, limit } = req.query;
  
  if (page && limit) {
    const p = parseInt(page as string);
    const l = parseInt(limit as string);
    const offset = (p - 1) * l;
    
    db.get('SELECT COUNT(*) as total FROM Transactions', (err, countRow: any) => {
      if (err) return res.status(500).json({ error: err.message });
      db.all('SELECT * FROM Transactions ORDER BY timestamp DESC LIMIT ? OFFSET ?', [l, offset], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, total: countRow.total });
      });
    });
  } else {
    db.all('SELECT * FROM Transactions ORDER BY timestamp DESC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.patch('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { description, category, amount, type } = req.body;
  db.run(
    `UPDATE Transactions SET description = ?, category = ?, amount = ?, type = ? WHERE id = ?`,
    [description, category, amount, type, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: true });
    }
  );
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Transactions WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true });
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

app.get('/api/categories', (req, res) => {
  /* #swagger.tags = ['Categories']
     #swagger.description = 'Obtener todas las categorías' */
  db.all('SELECT * FROM Categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map((r: any) => r.name));
  });
});

app.post('/api/categories', (req, res) => {
  /* #swagger.tags = ['Categories']
     #swagger.description = 'Crear una nueva categoría' */
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });
  
  const id = Date.now().toString();
  db.run(`INSERT INTO Categories (id, name) VALUES (?, ?)`, [id, name], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name });
  });
});

app.get('/api/exchange-rates', async (req, res) => {
  /* #swagger.tags = ['Rates']
     #swagger.description = 'Obtener cotizaciones reales desde ExchangeRate-API con caché' */
  
  const now = Date.now();
  if (ratesCache && (now - ratesCache.timestamp < CACHE_DURATION)) {
    return res.json({ base: 'ARS', rates: ratesCache.rates, timestamp: new Date(ratesCache.timestamp).toISOString(), source: 'cache' });
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const fallbackRates = { USD: 1050, EUR: 1141, PEN: 280, ARS: 1 };

  try {
    if (apiKey && apiKey !== 'your_free_api_key_here') {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/ARS`);
      const data = await response.json();
      if (data.result === 'success') {
        const rates = {
          USD: 1 / data.conversion_rates.USD,
          EUR: 1 / data.conversion_rates.EUR,
          PEN: 1 / data.conversion_rates.PEN,
          ARS: 1
        };
        ratesCache = { rates, timestamp: now };
        return res.json({ base: 'ARS', rates, timestamp: new Date().toISOString(), source: 'api' });
      }
    }
  } catch (e) {
    console.error('ExchangeRate-API Error:', e);
  }

  res.json({ base: 'ARS', rates: fallbackRates, timestamp: new Date().toISOString(), source: 'fallback' });
});

app.get('/api/config', (req, res) => {
  /* #swagger.tags = ['Config']
     #swagger.description = 'Obtener configuración del sistema (moneda base, etc.)' */
  res.json({ baseCurrency: 'USD' });
});

app.get('/api/budgets', (req, res) => {
  /* #swagger.tags = ['Budgets']
     #swagger.description = 'Obtener todos los presupuestos' */
  db.all('SELECT * FROM Budgets', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/budgets/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Budgets WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true });
  });
});

app.post('/api/budgets', (req, res) => {
  /* #swagger.tags = ['Budgets']
     #swagger.description = 'Establecer un presupuesto por categoría' */
  const BudgetSchema = z.object({
    category: z.string().min(1),
    limitAmount: z.number().positive(),
    currency: z.string().min(1),
    month: z.string().min(1)
  });

  try {
    const data = BudgetSchema.parse(req.body);
    const id = Date.now().toString();
    db.run(
      `INSERT INTO Budgets (id, category, limitAmount, currency, month) VALUES (?, ?, ?, ?, ?)`,
      [id, data.category, data.limitAmount, data.currency, data.month],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, ...data });
      }
    );
  } catch (err: any) {
    res.status(400).json({ error: "Datos inválidos", details: err.errors || err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
