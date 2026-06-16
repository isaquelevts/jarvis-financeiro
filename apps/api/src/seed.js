import { closePool, query } from "./db.js";

const transactions = [
  ["despesa", 45, "Alimentacao", "Lanche", "pix", "Utensils", "2026-06-13"],
  ["despesa", 23.5, "Transporte", "Uber", "credito", "Car", "2026-06-12"],
  ["despesa", 187.3, "Alimentacao", "Mercado Extra", "debito", "ShoppingCart", "2026-06-11"],
  ["despesa", 39.9, "Lazer", "Netflix", "credito", "Film", "2026-06-10"],
  ["despesa", 56, "Saude", "Farmacia", "pix", "Pill", "2026-06-08"],
  ["receita", 5000, "Salario", "Salario junho", "pix", "Wallet", "2026-06-05"],
  ["despesa", 1500, "Moradia", "Aluguel junho", "pix", "House", "2026-06-05"],
  ["despesa", 120, "Transporte", "Gasolina", "debito", "Fuel", "2026-06-03"],
  ["despesa", 89, "Alimentacao", "Restaurante", "credito", "Soup", "2026-06-02"],
  ["receita", 800, "Freelance", "Projeto web", "pix", "Laptop", "2026-06-01"],
];

const budgets = [
  ["Alimentacao", 800, "Utensils", "#f97316"],
  ["Transporte", 400, "Car", "#3b82f6"],
  ["Moradia", 1600, "House", "#8b5cf6"],
  ["Lazer", 200, "Film", "#ec4899"],
  ["Saude", 300, "Pill", "#22c55e"],
];

const cards = [
  ["Nubank", "Mastercard", "1234", 5000, 10, 17, "#7c3aed"],
  ["Inter", "Mastercard", "5678", 3000, 15, 22, "#ea580c"],
];

const recurringBills = [
  ["Aluguel", 1500, "Moradia", "House", 5, "pix", true, "#8b5cf6"],
  ["Internet", 99.9, "Moradia", "Box", 15, "debito", true, "#3b82f6"],
  ["Spotify", 19.9, "Lazer", "Film", 18, "credito", true, "#ec4899"],
  ["Academia", 89, "Saude", "Pill", 20, "debito", true, "#22c55e"],
];

try {
  const txCount = await query("SELECT count(*)::int AS count FROM transactions");
  if (txCount.rows[0].count === 0) {
    for (const tx of transactions) {
      await query(
        `INSERT INTO transactions
          (type, amount, category, description, method, icon, occurred_on)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        tx
      );
    }
  }

  const budgetCount = await query("SELECT count(*)::int AS count FROM budgets");
  if (budgetCount.rows[0].count === 0) {
    for (const budget of budgets) {
      await query(
        `INSERT INTO budgets (category, limit_amount, icon, color)
         VALUES ($1, $2, $3, $4)`,
        budget
      );
    }
  }

  const cardCount = await query("SELECT count(*)::int AS count FROM cards");
  if (cardCount.rows[0].count === 0) {
    for (const card of cards) {
      await query(
        `INSERT INTO cards (name, brand, last4, limit_amount, closing_day, due_day, color) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        card
      );
    }
  }

  const recCount = await query("SELECT count(*)::int AS count FROM recurring_bills");
  if (recCount.rows[0].count === 0) {
    for (const r of recurringBills) {
      await query(
        `INSERT INTO recurring_bills (name, amount, category, icon, due_day, method, active, color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        r
      );
    }
  }

  console.log("Seed data ready.");
} finally {
  await closePool();
}
