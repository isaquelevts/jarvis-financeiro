import cors from "cors";
import express from "express";
import { z } from "zod";
import { query } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3333);

app.use(cors());
app.use(express.json());

// ─── Schemas ──────────────────────────────────────────────────────────────────

const transactionSchema = z.object({
  type: z.enum(["receita", "despesa"]),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  description: z.string().trim().optional(),
  method: z.enum(["pix", "debito", "credito", "dinheiro"]),
  icon: z.string().min(1).default("Box"),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const budgetSchema = z.object({
  category: z.string().min(1),
  limit: z.coerce.number().min(0),
  icon: z.string().min(1).default("Box"),
  color: z.string().min(1).default("#111111"),
});

const cardSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1).default("Mastercard"),
  last4: z.string().regex(/^\d{4}$/),
  limit: z.coerce.number().min(0),
  closingDay: z.coerce.number().int().min(1).max(31),
  dueDay: z.coerce.number().int().min(1).max(31),
  color: z.string().min(1).default("#111111"),
});

const recurringSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  icon: z.string().min(1).default("Box"),
  dueDay: z.coerce.number().int().min(1).max(31),
  method: z.enum(["pix", "debito", "credito", "dinheiro"]),
  active: z.boolean().default(true),
  color: z.string().min(1).default("#111111"),
});

const installmentSchema = z.object({
  cardId: z.string().uuid(),
  description: z.string().min(1),
  category: z.string().min(1),
  icon: z.string().min(1).default("CreditCard"),
  amountPerInstallment: z.coerce.number().positive(),
  totalInstallments: z.coerce.number().int().min(1),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/),
});

// ─── Mappers ──────────────────────────────────────────────────────────────────

const asNumber = (v) => Number(v || 0);

function toTransaction(row) {
  return { id: row.id, type: row.type, amount: asNumber(row.amount), category: row.category, description: row.description, method: row.method, icon: row.icon, occurredOn: row.occurred_on, createdAt: row.created_at };
}

function toBudget(row) {
  return { id: row.id, category: row.category, limit: asNumber(row.limit_amount), icon: row.icon, color: row.color };
}

function toCard(row) {
  return { id: row.id, name: row.name, brand: row.brand, last4: row.last4, limit: asNumber(row.limit_amount), closingDay: row.closing_day, dueDay: row.due_day, color: row.color };
}

function toRecurring(row) {
  return { id: row.id, name: row.name, amount: asNumber(row.amount), category: row.category, icon: row.icon, dueDay: row.due_day, method: row.method, active: row.active, color: row.color };
}

function toInstallment(row) {
  return { id: row.id, cardId: row.card_id, description: row.description, category: row.category, icon: row.icon, amountPerInstallment: asNumber(row.amount_per_installment), totalInstallments: row.total_installments, startMonth: row.start_month };
}

// ─── Aggregate ────────────────────────────────────────────────────────────────

async function getAllData() {
  const [tx, budgets, cards, recurring, installments] = await Promise.all([
    query("SELECT *, occurred_on::text FROM transactions ORDER BY occurred_on DESC, created_at DESC"),
    query("SELECT * FROM budgets ORDER BY created_at ASC"),
    query("SELECT * FROM cards ORDER BY created_at ASC"),
    query("SELECT * FROM recurring_bills ORDER BY due_day ASC"),
    query("SELECT * FROM card_installments ORDER BY created_at DESC"),
  ]);
  return {
    transactions: tx.rows.map(toTransaction),
    budgets: budgets.rows.map(toBudget),
    cards: cards.rows.map(toCard),
    recurring: recurring.rows.map(toRecurring),
    installments: installments.rows.map(toInstallment),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/summary", async (_req, res, next) => { try { res.json(await getAllData()); } catch (e) { next(e); } });

// Transactions
app.get("/api/transactions", async (_req, res, next) => { try { const r = await query("SELECT *, occurred_on::text FROM transactions ORDER BY occurred_on DESC, created_at DESC"); res.json(r.rows.map(toTransaction)); } catch (e) { next(e); } });
app.post("/api/transactions", async (req, res, next) => {
  try {
    const p = transactionSchema.parse(req.body);
    const r = await query(`INSERT INTO transactions (type,amount,category,description,method,icon,occurred_on) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7::date,CURRENT_DATE)) RETURNING *,occurred_on::text`, [p.type,p.amount,p.category,p.description||p.category,p.method,p.icon,p.occurredOn||null]);
    res.status(201).json(toTransaction(r.rows[0]));
  } catch (e) { next(e); }
});
app.delete("/api/transactions/:id", async (req, res, next) => { try { await query("DELETE FROM transactions WHERE id=$1",[req.params.id]); res.status(204).end(); } catch (e) { next(e); } });

// Budgets
app.get("/api/budgets", async (_req, res, next) => { try { const r = await query("SELECT * FROM budgets ORDER BY created_at ASC"); res.json(r.rows.map(toBudget)); } catch (e) { next(e); } });
app.post("/api/budgets", async (req, res, next) => {
  try {
    const p = budgetSchema.parse(req.body);
    const r = await query("INSERT INTO budgets (category,limit_amount,icon,color) VALUES ($1,$2,$3,$4) RETURNING *",[p.category,p.limit,p.icon,p.color]);
    res.status(201).json(toBudget(r.rows[0]));
  } catch (e) { next(e); }
});
app.put("/api/budgets/:id", async (req, res, next) => {
  try {
    const p = budgetSchema.parse(req.body);
    const r = await query("UPDATE budgets SET category=$1,limit_amount=$2,icon=$3,color=$4 WHERE id=$5 RETURNING *",[p.category,p.limit,p.icon,p.color,req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(toBudget(r.rows[0]));
  } catch (e) { next(e); }
});
app.delete("/api/budgets/:id", async (req, res, next) => { try { await query("DELETE FROM budgets WHERE id=$1",[req.params.id]); res.status(204).end(); } catch (e) { next(e); } });

// Cards
app.get("/api/cards", async (_req, res, next) => { try { const r = await query("SELECT * FROM cards ORDER BY created_at ASC"); res.json(r.rows.map(toCard)); } catch (e) { next(e); } });
app.post("/api/cards", async (req, res, next) => {
  try {
    const p = cardSchema.parse(req.body);
    const r = await query("INSERT INTO cards (name,brand,last4,limit_amount,closing_day,due_day,color) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",[p.name,p.brand,p.last4,p.limit,p.closingDay,p.dueDay,p.color]);
    res.status(201).json(toCard(r.rows[0]));
  } catch (e) { next(e); }
});
app.put("/api/cards/:id", async (req, res, next) => {
  try {
    const p = cardSchema.parse(req.body);
    const r = await query("UPDATE cards SET name=$1,brand=$2,last4=$3,limit_amount=$4,closing_day=$5,due_day=$6,color=$7 WHERE id=$8 RETURNING *",[p.name,p.brand,p.last4,p.limit,p.closingDay,p.dueDay,p.color,req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(toCard(r.rows[0]));
  } catch (e) { next(e); }
});
app.delete("/api/cards/:id", async (req, res, next) => { try { await query("DELETE FROM cards WHERE id=$1",[req.params.id]); res.status(204).end(); } catch (e) { next(e); } });

// Recurring
app.get("/api/recurring", async (_req, res, next) => { try { const r = await query("SELECT * FROM recurring_bills ORDER BY due_day ASC"); res.json(r.rows.map(toRecurring)); } catch (e) { next(e); } });
app.post("/api/recurring", async (req, res, next) => {
  try {
    const p = recurringSchema.parse(req.body);
    const r = await query("INSERT INTO recurring_bills (name,amount,category,icon,due_day,method,active,color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",[p.name,p.amount,p.category,p.icon,p.dueDay,p.method,p.active,p.color]);
    res.status(201).json(toRecurring(r.rows[0]));
  } catch (e) { next(e); }
});
app.put("/api/recurring/:id", async (req, res, next) => {
  try {
    const p = recurringSchema.parse(req.body);
    const r = await query("UPDATE recurring_bills SET name=$1,amount=$2,category=$3,icon=$4,due_day=$5,method=$6,active=$7,color=$8 WHERE id=$9 RETURNING *",[p.name,p.amount,p.category,p.icon,p.dueDay,p.method,p.active,p.color,req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(toRecurring(r.rows[0]));
  } catch (e) { next(e); }
});
app.delete("/api/recurring/:id", async (req, res, next) => { try { await query("DELETE FROM recurring_bills WHERE id=$1",[req.params.id]); res.status(204).end(); } catch (e) { next(e); } });

// Installments
app.get("/api/installments", async (_req, res, next) => { try { const r = await query("SELECT * FROM card_installments ORDER BY created_at DESC"); res.json(r.rows.map(toInstallment)); } catch (e) { next(e); } });
app.post("/api/installments", async (req, res, next) => {
  try {
    const p = installmentSchema.parse(req.body);
    const r = await query("INSERT INTO card_installments (card_id,description,category,icon,amount_per_installment,total_installments,start_month) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",[p.cardId,p.description,p.category,p.icon,p.amountPerInstallment,p.totalInstallments,p.startMonth]);
    res.status(201).json(toInstallment(r.rows[0]));
  } catch (e) { next(e); }
});
app.delete("/api/installments/:id", async (req, res, next) => { try { await query("DELETE FROM card_installments WHERE id=$1",[req.params.id]); res.status(204).end(); } catch (e) { next(e); } });

// Error handler
app.use((error, _req, res, _next) => {
  if (error instanceof z.ZodError) { res.status(400).json({ error: "Dados invalidos", details: error.flatten() }); return; }
  console.error(error);
  res.status(500).json({ error: "Erro interno" });
});

app.listen(port, () => console.log(`Jarvis API listening on http://localhost:${port}`));
