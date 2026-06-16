import { closePool, query } from "./db.js";

const statements = [
  `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,
  `CREATE TABLE IF NOT EXISTS recurring_bills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    category text NOT NULL,
    icon text NOT NULL DEFAULT 'Box',
    due_day integer NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    method text NOT NULL DEFAULT 'pix',
    active boolean NOT NULL DEFAULT true,
    color text NOT NULL DEFAULT '#111111',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('receita', 'despesa')),
    amount numeric(12,2) NOT NULL CHECK (amount > 0),
    category text NOT NULL,
    description text NOT NULL,
    method text NOT NULL CHECK (method IN ('pix', 'debito', 'credito', 'dinheiro')),
    icon text NOT NULL DEFAULT 'Box',
    occurred_on date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL UNIQUE,
    limit_amount numeric(12,2) NOT NULL CHECK (limit_amount >= 0),
    icon text NOT NULL DEFAULT 'Box',
    color text NOT NULL DEFAULT '#111111',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    brand text NOT NULL,
    last4 text NOT NULL,
    limit_amount numeric(12,2) NOT NULL CHECK (limit_amount >= 0),
    closing_day integer NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
    due_day integer NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    color text NOT NULL DEFAULT '#111111',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS card_id uuid REFERENCES cards(id) ON DELETE SET NULL`,
  `CREATE TABLE IF NOT EXISTS card_installments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
    description text NOT NULL,
    category text NOT NULL,
    icon text NOT NULL DEFAULT 'CreditCard',
    amount_per_installment numeric(12,2) NOT NULL CHECK (amount_per_installment > 0),
    total_installments int NOT NULL CHECK (total_installments >= 1),
    start_month text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
];

try {
  for (const statement of statements) {
    await query(statement);
  }
  console.log("Database schema ready.");
} finally {
  await closePool();
}
