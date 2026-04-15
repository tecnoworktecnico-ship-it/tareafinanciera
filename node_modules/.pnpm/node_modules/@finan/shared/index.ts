// Definición de Tipos Compartidos

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  ARS = 'ARS',
  PEN = 'PEN'
}

export type User = {
  id: string;
  name: string;
  baseCurrency: Currency;
  email: string;
}

export type Account = {
  id: string;
  userId: string;
  name: string;
  currency: Currency;
  balance: number;
}

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER'
}

export type Transaction = {
  id: string;
  accountId: string;
  amount: number;      // Siempre positivo
  type: TransactionType;
  category: string;
  timestamp: string;   // ISO Date
  description?: string;
  targetAccountId?: string; // Solo para TRANSFER
}
