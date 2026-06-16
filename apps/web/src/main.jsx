import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down.js";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up.js";
import BarChart3 from "lucide-react/dist/esm/icons/chart-no-axes-column.js";
import Box from "lucide-react/dist/esm/icons/box.js";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days.js";
import Car from "lucide-react/dist/esm/icons/car.js";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.js";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left.js";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right.js";
import CreditCard from "lucide-react/dist/esm/icons/credit-card.js";
import Film from "lucide-react/dist/esm/icons/film.js";
import Fuel from "lucide-react/dist/esm/icons/fuel.js";
import House from "lucide-react/dist/esm/icons/house.js";
import Laptop from "lucide-react/dist/esm/icons/laptop.js";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard.js";
import LineChart from "lucide-react/dist/esm/icons/chart-line.js";
import Loader2 from "lucide-react/dist/esm/icons/loader-circle.js";
import Pencil from "lucide-react/dist/esm/icons/pencil.js";
import Pill from "lucide-react/dist/esm/icons/pill.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import ReceiptText from "lucide-react/dist/esm/icons/receipt-text.js";
import Repeat from "lucide-react/dist/esm/icons/repeat.js";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart.js";
import Soup from "lucide-react/dist/esm/icons/soup.js";
import Trash2 from "lucide-react/dist/esm/icons/trash-2.js";
import Utensils from "lucide-react/dist/esm/icons/utensils.js";
import Wallet from "lucide-react/dist/esm/icons/wallet.js";
import X from "lucide-react/dist/esm/icons/x.js";
import "./styles.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";
const BASE_BALANCE = 18561.2;
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MONTH_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const BUDGET_COLORS = ["#f97316","#3b82f6","#8b5cf6","#ec4899","#22c55e","#ef4444","#f59e0b","#14b8a6","#6366f1","#0ea5e9"];
const CARD_COLORS = ["#7c3aed","#ea580c","#1d4ed8","#16a34a","#dc2626","#0891b2","#7e22ce","#c2410c","#111111","#0f766e"];
const ICON_NAMES = ["Box","Car","CreditCard","Film","Fuel","House","Laptop","LineChart","Pill","Repeat","ShoppingCart","Soup","Utensils","Wallet"];

const icons = { Box, Car, CreditCard, Film, Fuel, House, Laptop, LineChart, Pill, Repeat, ShoppingCart, Soup, Utensils, Wallet };

const BASE_EXPENSE_CATS = [
  { name: "Alimentacao", label: "Alimentação", icon: "Utensils" },
  { name: "Transporte", label: "Transporte", icon: "Car" },
  { name: "Moradia", label: "Moradia", icon: "House" },
  { name: "Lazer", label: "Lazer", icon: "Film" },
  { name: "Saude", label: "Saúde", icon: "Pill" },
  { name: "Educacao", label: "Educação", icon: "Box" },
  { name: "Outros", label: "Outros", icon: "Box" },
];

const BASE_INCOME_CATS = [
  { name: "Salario", label: "Salário", icon: "Wallet" },
  { name: "Freelance", label: "Freelance", icon: "Laptop" },
  { name: "Investimentos", label: "Investimentos", icon: "LineChart" },
  { name: "Outros", label: "Outros", icon: "Box" },
];

const methods = [
  ["pix", "PIX"],
  ["debito", "Débito"],
  ["credito", "Crédito"],
  ["dinheiro", "Dinheiro"],
];

// ─── Categories context ────────────────────────────────────────────────────────

const CategoriesCtx = createContext(null);

function CategoriesProvider({ children }) {
  const [customCats, setCustomCats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jarvis_cats") || "[]"); } catch { return []; }
  });

  function addCustom(cat) {
    const next = [...customCats, { ...cat, custom: true }];
    setCustomCats(next);
    localStorage.setItem("jarvis_cats", JSON.stringify(next));
  }

  function removeCustom(name) {
    const next = customCats.filter(c => c.name !== name);
    setCustomCats(next);
    localStorage.setItem("jarvis_cats", JSON.stringify(next));
  }

  const expenseCats = [...BASE_EXPENSE_CATS, ...customCats.filter(c => c.type !== "income")];
  const incomeCats = [...BASE_INCOME_CATS, ...customCats.filter(c => c.type !== "expense")];
  const allCats = [...BASE_EXPENSE_CATS, ...BASE_INCOME_CATS, ...customCats];

  return (
    <CategoriesCtx.Provider value={{ expenseCats, incomeCats, allCats, customCats, addCustom, removeCustom }}>
      {children}
    </CategoriesCtx.Provider>
  );
}

function useCategories() {
  return useContext(CategoriesCtx);
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const demoData = {
  transactions: [
    { id: "d1", type: "despesa", amount: 45, category: "Alimentacao", description: "Lanche", method: "pix", icon: "Utensils", occurredOn: "2026-06-13", createdAt: "2026-06-13T10:00:00Z" },
    { id: "d2", type: "despesa", amount: 23.5, category: "Transporte", description: "Uber", method: "credito", icon: "Car", occurredOn: "2026-06-12", createdAt: "2026-06-12T18:40:00Z" },
    { id: "d3", type: "despesa", amount: 187.3, category: "Alimentacao", description: "Mercado Extra", method: "debito", icon: "ShoppingCart", occurredOn: "2026-06-11", createdAt: "2026-06-11T20:20:00Z" },
    { id: "d4", type: "despesa", amount: 39.9, category: "Lazer", description: "Netflix", method: "credito", icon: "Film", occurredOn: "2026-06-10", createdAt: "2026-06-10T08:00:00Z" },
    { id: "d5", type: "despesa", amount: 56, category: "Saude", description: "Farmacia", method: "pix", icon: "Pill", occurredOn: "2026-06-08", createdAt: "2026-06-08T15:30:00Z" },
    { id: "d6", type: "receita", amount: 5000, category: "Salario", description: "Salario junho", method: "pix", icon: "Wallet", occurredOn: "2026-06-05", createdAt: "2026-06-05T09:00:00Z" },
    { id: "d7", type: "despesa", amount: 1500, category: "Moradia", description: "Aluguel junho", method: "pix", icon: "House", occurredOn: "2026-06-05", createdAt: "2026-06-05T08:30:00Z" },
    { id: "d8", type: "despesa", amount: 120, category: "Transporte", description: "Gasolina", method: "debito", icon: "Fuel", occurredOn: "2026-06-03", createdAt: "2026-06-03T17:15:00Z" },
    { id: "d9", type: "despesa", amount: 89, category: "Alimentacao", description: "Restaurante", method: "credito", icon: "Soup", occurredOn: "2026-06-02", createdAt: "2026-06-02T22:00:00Z" },
    { id: "d10", type: "receita", amount: 800, category: "Freelance", description: "Projeto web", method: "pix", icon: "Laptop", occurredOn: "2026-06-01", createdAt: "2026-06-01T12:00:00Z" },
  ],
  budgets: [
    { id: "b1", category: "Alimentacao", limit: 800, icon: "Utensils", color: "#f97316" },
    { id: "b2", category: "Transporte", limit: 400, icon: "Car", color: "#3b82f6" },
    { id: "b3", category: "Moradia", limit: 1600, icon: "House", color: "#8b5cf6" },
    { id: "b4", category: "Lazer", limit: 200, icon: "Film", color: "#ec4899" },
    { id: "b5", category: "Saude", limit: 300, icon: "Pill", color: "#22c55e" },
  ],
  cards: [
    { id: "c1", name: "Nubank", brand: "Mastercard", last4: "1234", limit: 5000, closingDay: 10, dueDay: 17, color: "#7c3aed" },
    { id: "c2", name: "Inter", brand: "Mastercard", last4: "5678", limit: 3000, closingDay: 15, dueDay: 22, color: "#ea580c" },
  ],
  recurring: [
    { id: "r1", name: "Aluguel", amount: 1500, category: "Moradia", icon: "House", dueDay: 5, method: "pix", active: true, color: "#8b5cf6" },
    { id: "r2", name: "Internet", amount: 99.9, category: "Moradia", icon: "Box", dueDay: 15, method: "debito", active: true, color: "#3b82f6" },
    { id: "r3", name: "Spotify", amount: 19.9, category: "Lazer", icon: "Film", dueDay: 18, method: "credito", active: true, color: "#ec4899" },
    { id: "r4", name: "Academia", amount: 89, category: "Saude", icon: "Pill", dueDay: 20, method: "debito", active: true, color: "#22c55e" },
    { id: "r5", name: "Netflix", amount: 39.9, category: "Lazer", icon: "Film", dueDay: 10, method: "credito", active: false, color: "#ef4444" },
  ],
  installments: [
    { id: "i1", cardId: "c1", description: "iPhone 15 Pro", category: "Outros", icon: "CreditCard", amountPerInstallment: 450, totalInstallments: 12, startMonth: "2026-02" },
    { id: "i2", cardId: "c2", description: "Notebook Dell", category: "Educacao", icon: "Laptop", amountPerInstallment: 380, totalInstallments: 6, startMonth: "2026-04" },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function money(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function displayCategory(cat, allCats) {
  const list = allCats || [...BASE_EXPENSE_CATS, ...BASE_INCOME_CATS];
  return list.find(c => c.name === cat)?.label || cat;
}

function shortDate(date) {
  const [, m, d] = String(date).split("-");
  return `${d} ${MONTH_SHORT[Number(m) - 1] || ""}`;
}

function todayYM() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function adjustMonth(ym, delta) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ymLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function ymShort(ym) {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTH_SHORT[m - 1]} ${y}`;
}

function monthsBetween(ym1, ym2) {
  const [y1, m1] = ym1.split("-").map(Number);
  const [y2, m2] = ym2.split("-").map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

// ─── Data hook ────────────────────────────────────────────────────────────────

function useFinanceData() {
  const [data, setData] = useState({ transactions: [], budgets: [], cards: [], recurring: [], installments: [] });
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  async function load() {
    try {
      setIsDemo(false);
      const res = await fetch(`${API_URL}/summary`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setData(demoData);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function callApi(method, path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.status === 204) return null;
    return res.json();
  }

  // Transactions
  async function createTransaction(payload) {
    if (isDemo) {
      const item = { id: `d-${Date.now()}`, ...payload, occurredOn: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() };
      setData(d => ({ ...d, transactions: [item, ...d.transactions] }));
      return;
    }
    const item = await callApi("POST", "/transactions", payload);
    setData(d => ({ ...d, transactions: [item, ...d.transactions] }));
  }

  async function deleteTransaction(id) {
    if (isDemo) { setData(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== id) })); return; }
    await callApi("DELETE", `/transactions/${id}`);
    setData(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== id) }));
  }

  // Budgets
  async function createBudget(payload) {
    if (isDemo) { setData(d => ({ ...d, budgets: [...d.budgets, { id: `b-${Date.now()}`, ...payload }] })); return; }
    const item = await callApi("POST", "/budgets", payload);
    setData(d => ({ ...d, budgets: [...d.budgets, item] }));
  }

  async function updateBudget(id, payload) {
    if (isDemo) { setData(d => ({ ...d, budgets: d.budgets.map(b => b.id === id ? { ...b, ...payload } : b) })); return; }
    const item = await callApi("PUT", `/budgets/${id}`, payload);
    setData(d => ({ ...d, budgets: d.budgets.map(b => b.id === id ? item : b) }));
  }

  async function deleteBudget(id) {
    if (isDemo) { setData(d => ({ ...d, budgets: d.budgets.filter(b => b.id !== id) })); return; }
    await callApi("DELETE", `/budgets/${id}`);
    setData(d => ({ ...d, budgets: d.budgets.filter(b => b.id !== id) }));
  }

  // Cards
  async function createCard(payload) {
    if (isDemo) { setData(d => ({ ...d, cards: [...d.cards, { id: `c-${Date.now()}`, ...payload }] })); return; }
    const item = await callApi("POST", "/cards", payload);
    setData(d => ({ ...d, cards: [...d.cards, item] }));
  }

  async function updateCard(id, payload) {
    if (isDemo) { setData(d => ({ ...d, cards: d.cards.map(c => c.id === id ? { ...c, ...payload } : c) })); return; }
    const item = await callApi("PUT", `/cards/${id}`, payload);
    setData(d => ({ ...d, cards: d.cards.map(c => c.id === id ? item : c) }));
  }

  async function deleteCard(id) {
    if (isDemo) { setData(d => ({ ...d, cards: d.cards.filter(c => c.id !== id) })); return; }
    await callApi("DELETE", `/cards/${id}`);
    setData(d => ({ ...d, cards: d.cards.filter(c => c.id !== id) }));
  }

  // Recurring
  async function createRecurring(payload) {
    if (isDemo) { setData(d => ({ ...d, recurring: [...d.recurring, { id: `r-${Date.now()}`, active: true, ...payload }] })); return; }
    const item = await callApi("POST", "/recurring", payload);
    setData(d => ({ ...d, recurring: [...d.recurring, item] }));
  }

  async function updateRecurring(id, payload) {
    if (isDemo) { setData(d => ({ ...d, recurring: d.recurring.map(r => r.id === id ? { ...r, ...payload } : r) })); return; }
    const item = await callApi("PUT", `/recurring/${id}`, payload);
    setData(d => ({ ...d, recurring: d.recurring.map(r => r.id === id ? item : r) }));
  }

  async function deleteRecurring(id) {
    if (isDemo) { setData(d => ({ ...d, recurring: d.recurring.filter(r => r.id !== id) })); return; }
    await callApi("DELETE", `/recurring/${id}`);
    setData(d => ({ ...d, recurring: d.recurring.filter(r => r.id !== id) }));
  }

  // Installments
  async function createInstallment(payload) {
    if (isDemo) {
      const item = { id: `i-${Date.now()}`, ...payload };
      setData(d => ({ ...d, installments: [...(d.installments || []), item] }));
      return;
    }
    const item = await callApi("POST", "/installments", payload);
    setData(d => ({ ...d, installments: [...(d.installments || []), item] }));
  }

  async function deleteInstallment(id) {
    if (isDemo) { setData(d => ({ ...d, installments: (d.installments || []).filter(i => i.id !== id) })); return; }
    await callApi("DELETE", `/installments/${id}`);
    setData(d => ({ ...d, installments: (d.installments || []).filter(i => i.id !== id) }));
  }

  return {
    data, loading, isDemo, reload: load,
    createTransaction, deleteTransaction,
    createBudget, updateBudget, deleteBudget,
    createCard, updateCard, deleteCard,
    createRecurring, updateRecurring, deleteRecurring,
    createInstallment, deleteInstallment,
  };
}

// ─── Enrich data ──────────────────────────────────────────────────────────────

function enrichData(data, month) {
  const sorted = [...data.transactions].sort((a, b) =>
    `${b.occurredOn}${b.createdAt || ""}`.localeCompare(`${a.occurredOn}${a.createdAt || ""}`)
  );

  const transactions = month ? sorted.filter(tx => tx.occurredOn?.startsWith(month)) : sorted;
  const income = transactions.filter(tx => tx.type === "receita").reduce((s, tx) => s + tx.amount, 0);
  const expense = transactions.filter(tx => tx.type === "despesa").reduce((s, tx) => s + tx.amount, 0);

  const budgets = data.budgets.map(b => {
    const spent = transactions.filter(tx => tx.type === "despesa" && tx.category === b.category).reduce((s, tx) => s + tx.amount, 0);
    const pct = b.limit ? Math.round((spent / b.limit) * 100) : 0;
    return { ...b, spent, pct, state: pct >= 100 ? "over" : pct >= 80 ? "warn" : "ok", remaining: Math.max(0, b.limit - spent) };
  });

  const allIncome = sorted.filter(tx => tx.type === "receita").reduce((s, tx) => s + tx.amount, 0);
  const allExpense = sorted.filter(tx => tx.type === "despesa").reduce((s, tx) => s + tx.amount, 0);
  const cardExpense = transactions.filter(tx => tx.method === "credito" && tx.type === "despesa");
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);

  return {
    transactions,
    allTransactions: sorted,
    budgets,
    cards: data.cards,
    recurring: data.recurring || [],
    installments: data.installments || [],
    income,
    expense,
    balance: BASE_BALANCE + allIncome - allExpense,
    totalBudget,
    budgetRemaining: Math.max(0, totalBudget - expense),
    cardExpense,
  };
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const ops = useFinanceData();
  const { data, loading, isDemo, reload } = ops;
  const [screen, setScreen] = useState("dashboard");
  const [month, setMonth] = useState(todayYM);
  const [modal, setModal] = useState(null);
  const [selectedCard, setSelectedCard] = useState(0);

  const model = useMemo(() => enrichData(data, month), [data, month]);

  function openModal(type, payload = null) { setModal({ type, data: payload }); }
  function closeModal() { setModal(null); }

  return (
    <CategoriesProvider>
      <main className="page-shell">
        <section className="phone">
          <StatusBar />
          {isDemo && <DemoBanner onRetry={reload} />}
          <div className="content">
            {loading ? <LoadingState /> : (
              <>
                {screen === "dashboard" && <Dashboard model={model} month={month} setMonth={setMonth} openModal={openModal} setScreen={setScreen} />}
                {screen === "transactions" && <Transactions model={model} month={month} setMonth={setMonth} openModal={openModal} onDelete={ops.deleteTransaction} />}
                {screen === "budgets" && <Budgets model={model} openModal={openModal} />}
                {screen === "cards" && <Cards model={model} selectedCard={selectedCard} setSelectedCard={setSelectedCard} openModal={openModal} deleteInstallment={ops.deleteInstallment} />}
                {screen === "reports" && <Reports model={model} month={month} setMonth={setMonth} />}
                {screen === "fixas" && <Fixas model={model} openModal={openModal} onUpdate={ops.updateRecurring} onDelete={ops.deleteRecurring} />}
              </>
            )}
          </div>
          <BottomNav screen={screen} setScreen={setScreen} />

          {(modal?.type === "receita" || modal?.type === "despesa") && (
            <TransactionModal
              initialType={modal.type}
              onClose={closeModal}
              onSubmit={async p => { await ops.createTransaction(p); closeModal(); }}
            />
          )}

          {modal?.type === "budget" && (
            <BudgetModal
              budget={modal.data}
              onClose={closeModal}
              onSave={async p => { modal.data?.id ? await ops.updateBudget(modal.data.id, p) : await ops.createBudget(p); closeModal(); }}
              onDelete={modal.data ? async () => { await ops.deleteBudget(modal.data.id); closeModal(); } : null}
            />
          )}

          {modal?.type === "card" && (
            <CardModal
              card={modal.data}
              onClose={closeModal}
              onSave={async p => { modal.data?.id ? await ops.updateCard(modal.data.id, p) : await ops.createCard(p); closeModal(); }}
              onDelete={modal.data ? async () => { await ops.deleteCard(modal.data.id); closeModal(); } : null}
            />
          )}

          {modal?.type === "recurring" && (
            <RecurringModal
              bill={modal.data}
              onClose={closeModal}
              onSave={async p => { modal.data?.id ? await ops.updateRecurring(modal.data.id, p) : await ops.createRecurring(p); closeModal(); }}
              onDelete={modal.data ? async () => { await ops.deleteRecurring(modal.data.id); closeModal(); } : null}
            />
          )}

          {modal?.type === "installment" && (
            <InstallmentModal
              cardId={modal.data?.cardId}
              cards={model.cards}
              onClose={closeModal}
              onSave={async p => { await ops.createInstallment(p); closeModal(); }}
            />
          )}
        </section>
      </main>
    </CategoriesProvider>
  );
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function Icon({ name, size = 20, strokeWidth = 2.3 }) {
  const C = icons[name] || Box;
  return <C size={size} strokeWidth={strokeWidth} />;
}

function MonthPicker({ value, onChange }) {
  const [y, m] = value.split("-").map(Number);
  return (
    <div className="month-picker">
      <button type="button" onClick={() => onChange(adjustMonth(value, -1))}>
        <ChevronLeft size={14} />
      </button>
      <span>{MONTH_SHORT[m - 1]} {y}</span>
      <button type="button" onClick={() => onChange(adjustMonth(value, 1))} disabled={value >= todayYM()}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function Progress({ value, color }) {
  return (
    <div className="progress">
      <span style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  );
}

function SectionTitle({ title, action, onClick, onAdd }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {action && <button onClick={onClick}>{action}</button>}
      {onAdd && (
        <button className="add-btn" onClick={onAdd} aria-label={`Adicionar ${title}`}>
          <Plus size={16} />
        </button>
      )}
    </div>
  );
}

function Stat({ label, value, good }) {
  return (
    <article className="white-card stat">
      <p>{label}</p>
      <strong className={good ? "positive" : "negative"}>{value}</strong>
    </article>
  );
}

function Empty({ title }) {
  return <span className="empty">{title}</span>;
}

function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div className="status-icons">
        <span className="signal" />
        <span className="wifi" />
        <span className="battery" />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="center-state">
      <Loader2 className="spin" size={28} />
      <p>Carregando...</p>
    </div>
  );
}

function DemoBanner({ onRetry }) {
  return (
    <button className="demo-banner" onClick={onRetry}>
      Modo demo · banco desconectado
    </button>
  );
}

function ColorPicker({ value, onChange, colors }) {
  return (
    <div className="color-picker">
      {colors.map(c => (
        <button
          key={c}
          type="button"
          className={`color-dot${value === c ? " selected" : ""}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div className="icon-picker">
      {ICON_NAMES.map(name => (
        <button
          key={name}
          type="button"
          className={`icon-pick-btn${value === name ? " active" : ""}`}
          onClick={() => onChange(name)}
        >
          <Icon name={name} size={17} />
        </button>
      ))}
    </div>
  );
}

function CategoryPickerInline({ value, onChange, type = "expense" }) {
  const { expenseCats, incomeCats, addCustom, removeCustom } = useCategories();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const list = type === "income" ? incomeCats : expenseCats;
  const current = list.find(c => c.name === value) || { name: value, label: value, icon: "Box" };

  function handleAdd() {
    if (!newLabel.trim()) return;
    const name = newLabel.trim();
    addCustom({ name, label: name, icon: "Box", type });
    onChange(name);
    setNewLabel("");
    setAdding(false);
    setOpen(false);
  }

  return (
    <div className="cat-picker-wrap">
      <button type="button" className="cat-picker-trigger" onClick={() => setOpen(o => !o)}>
        <span className="icon-box" style={{ width: 28, height: 28, borderRadius: 8, flex: "0 0 28px" }}>
          <Icon name={current.icon} size={14} />
        </span>
        <span className="cat-label">{current.label}</span>
        <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
      </button>

      {open && (
        <div className="cat-picker-panel">
          {list.map(cat => (
            <div key={cat.name} className={`cat-pick-item${value === cat.name ? " active" : ""}`}>
              <button
                type="button"
                className="cat-pick-item-btn"
                onClick={() => { onChange(cat.name); setOpen(false); }}
              >
                <Icon name={cat.icon} size={15} />
                <span>{cat.label}</span>
              </button>
              {cat.custom && (
                <button
                  type="button"
                  className="cat-pick-delete"
                  onClick={() => {
                    removeCustom(cat.name);
                    if (value === cat.name) onChange(list.find(c => !c.custom)?.name || "");
                  }}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}

          {adding ? (
            <div className="cat-pick-add-form">
              <input
                autoFocus
                placeholder="Nome da categoria"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
              />
              <button type="button" className="cat-pick-form-btn" onClick={handleAdd}><Plus size={14} /></button>
              <button type="button" className="cat-pick-form-btn cancel" onClick={() => { setAdding(false); setNewLabel(""); }}><X size={14} /></button>
            </div>
          ) : (
            <button type="button" className="cat-pick-add" onClick={() => setAdding(true)}>
              <Plus size={13} /> Nova categoria
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function BottomNav({ screen, setScreen }) {
  const items = [
    ["dashboard", "Home", LayoutDashboard],
    ["transactions", "Lançar", ReceiptText],
    ["budgets", "Budget", BarChart3],
    ["cards", "Cartões", CreditCard],
    ["reports", "Análise", LineChart],
    ["fixas", "Fixas", Repeat],
  ];
  return (
    <nav className="bottom-nav">
      {items.map(([key, label, C]) => (
        <button
          key={key}
          className={screen === key ? "active" : ""}
          onClick={() => setScreen(key)}
        >
          <C size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ model, month, setMonth, openModal, setScreen }) {
  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-left">
          <p className="eyebrow">BOM DIA,</p>
          <h1>Isaque</h1>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </header>

      <BalanceCard model={model} month={month} openModal={openModal} setScreen={setScreen} />
      <BudgetPreview budgets={model.budgets.slice(0, 3)} setScreen={setScreen} />
      <TransactionPreview transactions={model.transactions.slice(0, 5)} setScreen={setScreen} />
      <UpcomingBills model={model} month={month} />
    </div>
  );
}

function BalanceCard({ model, openModal, setScreen }) {
  return (
    <section className="balance-card">
      <div className="card-row">
        <div className="card-chip" />
        <span>**** 1234</span>
        <b>JUN 2026</b>
      </div>
      <p className="dark-label">SALDO TOTAL</p>
      <h2>{money(model.balance)}</h2>
      <div className="summary-grid">
        <div>
          <small>RECEITAS</small>
          <strong>{money(model.income)}</strong>
        </div>
        <div>
          <small>DESPESAS</small>
          <strong>{money(model.expense)}</strong>
        </div>
      </div>
      <div className="quick-actions">
        <button onClick={() => openModal("receita")}>
          <ArrowUp size={18} />
          Receita
        </button>
        <button onClick={() => openModal("despesa")}>
          <ArrowDown size={18} />
          Despesa
        </button>
        <button onClick={() => setScreen("cards")}>
          <CreditCard size={18} />
          Cartões
        </button>
        <button onClick={() => setScreen("reports")}>
          <BarChart3 size={18} />
          Análise
        </button>
      </div>
    </section>
  );
}

function BudgetPreview({ budgets, setScreen }) {
  return (
    <section className="block">
      <SectionTitle title="Orçamentos" action="Ver todos" onClick={() => setScreen("budgets")} />
      {budgets.length ? budgets.map(b => <BudgetRow budget={b} compact key={b.id} />) : <Empty title="Nenhum orçamento cadastrado" />}
    </section>
  );
}

function BudgetRow({ budget, compact = false, onEdit, onDelete }) {
  const { allCats } = useCategories();
  const color = budget.state === "over" ? "#ef4444" : budget.state === "warn" ? "#f59e0b" : budget.color;
  return (
    <article className={`white-card budget-row ${compact ? "compact" : ""}`}>
      <div className="row-head">
        <div className="row-main">
          <span className="icon-box"><Icon name={budget.icon} /></span>
          <div>
            <h3>{displayCategory(budget.category, allCats)}</h3>
            {!compact && <p>Limite: {money(budget.limit)}</p>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`badge ${budget.state}`}>{budget.pct}%</span>
          {(onEdit || onDelete) && (
            <div className="row-actions">
              {onEdit && <button onClick={onEdit}><Pencil size={13} /></button>}
              {onDelete && <button className="danger" onClick={onDelete}><Trash2 size={13} /></button>}
            </div>
          )}
        </div>
      </div>
      <Progress value={budget.pct} color={color} />
      <div className="budget-meta">
        <span>{money(budget.spent)} de {money(budget.limit)}</span>
        <span>restam {money(budget.remaining)}</span>
      </div>
    </article>
  );
}

function TransactionPreview({ transactions, setScreen }) {
  return (
    <section className="block">
      <SectionTitle title="Últimas transações" action="Ver todas" onClick={() => setScreen("transactions")} />
      <div className="white-card list-card">
        {transactions.length ? transactions.map(tx => <TransactionRow tx={tx} key={tx.id} />) : <Empty title="Nenhum lançamento no mês" />}
      </div>
    </section>
  );
}

function TransactionRow({ tx, invoice = false, onDelete }) {
  const { allCats } = useCategories();
  const value = invoice ? money(tx.amount) : `${tx.type === "receita" ? "+" : "-"}${money(tx.amount)}`;
  return (
    <article className="transaction-row">
      <span className="icon-box"><Icon name={tx.icon} /></span>
      <div>
        <h3>{tx.description}</h3>
        <p>{displayCategory(tx.category, allCats)} · {invoice ? shortDate(tx.occurredOn) : tx.method}</p>
      </div>
      <strong className={tx.type === "receita" ? "positive" : invoice ? "" : "negative"}>{value}</strong>
      {onDelete && (
        <button className="tx-delete-btn" onClick={() => onDelete(tx.id)} aria-label="Excluir">
          <Trash2 size={13} />
        </button>
      )}
    </article>
  );
}

function UpcomingBills({ model, month }) {
  const [y, m] = month.split("-").map(Number);
  const today = new Date();
  const isCurrent = today.getFullYear() === y && today.getMonth() + 1 === m;
  const todayDay = today.getDate();

  const bills = useMemo(() => {
    const list = [];

    model.recurring.filter(r => r.active).forEach(r => {
      const daysLeft = isCurrent ? r.dueDay - todayDay : null;
      list.push({ name: r.name, amount: r.amount, dueDay: r.dueDay, icon: r.icon, daysLeft });
    });

    const creditTotal = model.cardExpense.reduce((s, tx) => s + tx.amount, 0);
    if (creditTotal > 0) {
      model.cards.forEach(card => {
        const daysLeft = isCurrent ? card.dueDay - todayDay : null;
        list.push({ name: `${card.name} · fatura`, amount: creditTotal, dueDay: card.dueDay, icon: "CreditCard", daysLeft });
      });
    }

    return list.sort((a, b) => {
      const aPast = a.daysLeft !== null && a.daysLeft < 0;
      const bPast = b.daysLeft !== null && b.daysLeft < 0;
      if (aPast !== bPast) return aPast ? 1 : -1;
      return a.dueDay - b.dueDay;
    }).slice(0, 5);
  }, [model, month]);

  if (!bills.length) return null;

  return (
    <section className="block">
      <SectionTitle title="Próximos vencimentos" />
      {bills.map((bill, i) => {
        const past = bill.daysLeft !== null && bill.daysLeft < 0;
        const alert = bill.daysLeft !== null && bill.daysLeft >= 0 && bill.daysLeft <= 3;
        return (
          <article className="white-card due-row" key={i}>
            <span className="icon-box"><Icon name={bill.icon} /></span>
            <div>
              <h3>{bill.name}</h3>
              <p>Dia {bill.dueDay} · {MONTH_SHORT[m - 1]}</p>
            </div>
            <div className="due-value">
              <strong>{money(bill.amount)}</strong>
              {bill.daysLeft !== null && (
                <span className={alert ? "warn-text" : past ? "negative" : ""}>
                  {past ? "Vencido" : bill.daysLeft === 0 ? "Hoje" : `${bill.daysLeft}d`}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

// ─── Transactions ─────────────────────────────────────────────────────────────

function Transactions({ model, month, setMonth, openModal, onDelete }) {
  const { allCats } = useCategories();
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState(null);

  const filtered = useMemo(() => {
    return model.transactions.filter(tx => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (catFilter && tx.category !== catFilter) return false;
      return true;
    });
  }, [model.transactions, typeFilter, catFilter]);

  const groups = useMemo(() => {
    return filtered.reduce((acc, tx) => {
      acc[tx.occurredOn] = acc[tx.occurredOn] || [];
      acc[tx.occurredOn].push(tx);
      return acc;
    }, {});
  }, [filtered]);

  const usedCats = useMemo(() => {
    const s = new Set(model.transactions.map(tx => tx.category));
    return [...s];
  }, [model.transactions]);

  return (
    <div className="screen">
      <header className="topbar">
        <h1>Lançamentos</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <MonthPicker value={month} onChange={setMonth} />
          <button className="round-button dark" onClick={() => openModal("despesa")} aria-label="Adicionar">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="tx-filter-bar">
        <div className="tabs cols-3" style={{ margin: 0 }}>
          {[["all", "Todos"], ["receita", "Receitas"], ["despesa", "Despesas"]].map(([v, l]) => (
            <button key={v} className={typeFilter === v ? "active" : ""} onClick={() => setTypeFilter(v)}>{l}</button>
          ))}
        </div>
        <div className="filter-cats">
          <button className={`filter-cat-btn${!catFilter ? " active" : ""}`} onClick={() => setCatFilter(null)}>Todos</button>
          {usedCats.map(cat => (
            <button key={cat} className={`filter-cat-btn${catFilter === cat ? " active" : ""}`} onClick={() => setCatFilter(cat === catFilter ? null : cat)}>
              {displayCategory(cat, allCats)}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <Stat label="RECEITAS" value={money(model.income)} good />
        <Stat label="DESPESAS" value={money(model.expense)} />
      </div>

      <section className="block">
        {Object.keys(groups).length ? Object.entries(groups).map(([date, items]) => (
          <div className="date-group" key={date}>
            <p className="date-label">{shortDate(date)}</p>
            <div className="white-card list-card">
              {items.map(tx => <TransactionRow tx={tx} key={tx.id} onDelete={onDelete} />)}
            </div>
          </div>
        )) : <Empty title="Nenhum lançamento encontrado" />}
      </section>
    </div>
  );
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

function Budgets({ model, openModal }) {
  const overallPct = model.totalBudget ? Math.round((model.expense / model.totalBudget) * 100) : 0;
  return (
    <div className="screen">
      <header className="topbar simple">
        <div>
          <h1>Orçamentos</h1>
        </div>
        <button className="round-button dark" onClick={() => openModal("budget")} aria-label="Novo orçamento">
          <Plus size={20} />
        </button>
      </header>

      <section className="overview-card" style={{ margin: "0 20px 22px" }}>
        <p>TOTAL ORÇADO</p>
        <h2>{money(model.totalBudget)}</h2>
        <Progress value={overallPct} color={overallPct >= 80 ? "#f59e0b" : "#22c55e"} />
        <div className="overview-meta">
          <div>
            <span>GASTO</span>
            <strong className="negative">{money(model.expense)}</strong>
          </div>
          <div>
            <span>DISPONÍVEL</span>
            <strong className="positive">{money(model.budgetRemaining)}</strong>
          </div>
        </div>
      </section>

      <section className="block">
        {model.budgets.length ? model.budgets.map(b => (
          <BudgetRow
            budget={b}
            key={b.id}
            onEdit={() => openModal("budget", b)}
            onDelete={() => openModal("budget", { ...b, _confirmDelete: true })}
          />
        )) : <Empty title="Nenhum orçamento cadastrado" />}
      </section>
    </div>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function InstallmentRow({ inst, onDelete }) {
  const idx = monthsBetween(inst.startMonth, todayYM());
  const installmentNum = Math.min(Math.max(1, idx + 1), inst.totalInstallments);
  return (
    <article className="transaction-row">
      <span className="icon-box"><Icon name={inst.icon || "CreditCard"} /></span>
      <div>
        <h3>{inst.description}</h3>
        <p>{inst.category} · Parcela {installmentNum}/{inst.totalInstallments}</p>
      </div>
      <span className="installment-badge">{inst.totalInstallments - Math.max(0, idx)} restantes</span>
      <strong className="negative">-{money(inst.amountPerInstallment)}</strong>
      <button className="tx-delete-btn" onClick={() => onDelete(inst.id)} aria-label="Excluir">
        <Trash2 size={13} />
      </button>
    </article>
  );
}

function Cards({ model, selectedCard, setSelectedCard, openModal, deleteInstallment }) {
  const card = model.cards[selectedCard] || model.cards[0];
  const cardExpenseForCard = model.cardExpense;
  const used = cardExpenseForCard.reduce((s, tx) => s + tx.amount, 0);
  const pct = card?.limit ? Math.round((used / card.limit) * 100) : 0;
  const cardInstallments = card ? (model.installments || []).filter(i => i.cardId === card.id) : [];

  return (
    <div className="screen">
      <header className="topbar simple">
        <h1>Cartões</h1>
        <button className="round-button dark" onClick={() => openModal("card")} aria-label="Novo cartão">
          <Plus size={20} />
        </button>
      </header>

      {model.cards.length === 0 ? (
        <div className="block"><Empty title="Nenhum cartão cadastrado" /></div>
      ) : (
        <>
          <div className="cards-scroll">
            {model.cards.map((c, i) => (
              <div
                key={c.id}
                className={`credit-visual${selectedCard === i ? " selected" : ""}`}
                style={{ background: c.color }}
                onClick={() => setSelectedCard(i)}
              >
                <div className="credit-visual-top">
                  <CreditCard size={26} />
                  <span>{c.brand}</span>
                </div>
                <h3>{c.name}</h3>
                <p>**** **** **** {c.last4}</p>
              </div>
            ))}
          </div>

          {card && (
            <>
              <section className="white-card card-limit" style={{ margin: "0 20px 14px" }}>
                <div className="section-title tight">
                  <h2>Limite usado</h2>
                  <b>{pct}%</b>
                </div>
                <Progress value={pct} color={card.color} />
                <div className="budget-meta">
                  <span>{money(used)} usados</span>
                  <span>{money(Math.max(0, card.limit - used))} livres</span>
                </div>
              </section>

              <div className="stats-grid">
                <Stat label="FECHA" value={`Dia ${card.closingDay}`} />
                <Stat label="VENCE" value={`Dia ${card.dueDay}`} />
              </div>

              <div className="card-actions">
                <button className="edit-btn" onClick={() => openModal("card", card)}>
                  <Pencil size={15} /> Editar
                </button>
                <button className="del-btn" onClick={() => openModal("card", { ...card, _confirmDelete: true })}>
                  <Trash2 size={15} /> Excluir
                </button>
                <button className="new-btn" onClick={() => openModal("installment", { cardId: card.id })}>
                  <Plus size={15} /> Parcela
                </button>
              </div>

              <section className="block">
                <SectionTitle title="Parcelamentos" onAdd={() => openModal("installment", { cardId: card.id })} />
                {cardInstallments.length ? (
                  <div className="white-card list-card">
                    {cardInstallments.map(inst => (
                      <InstallmentRow key={inst.id} inst={inst} onDelete={deleteInstallment} />
                    ))}
                  </div>
                ) : <Empty title="Nenhum parcelamento neste cartão" />}
              </section>

              <section className="block">
                <SectionTitle title="Fatura atual" />
                {cardExpenseForCard.length ? (
                  <div className="white-card list-card">
                    {cardExpenseForCard.map(tx => <TransactionRow tx={tx} invoice key={tx.id} />)}
                  </div>
                ) : <Empty title="Sem despesas no crédito este mês" />}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────

function Reports({ model, month, setMonth }) {
  const months = Array.from({ length: 6 }, (_, i) => adjustMonth(month, i - 5));
  const mockIncome = [3200, 5000, 4500, 5000, 5800, Math.max(model.income, 100)];
  const mockExpense = [2800, 3100, 2600, 3400, 2900, Math.max(model.expense, 100)];
  const max = Math.max(...mockIncome, ...mockExpense);
  const categories = model.budgets.map(b => ({ ...b, value: b.spent })).filter(b => b.value > 0).sort((a, b) => b.value - a.value);

  return (
    <div className="screen">
      <header className="topbar">
        <h1>Análise</h1>
        <MonthPicker value={month} onChange={setMonth} />
      </header>

      <div className="stats-grid">
        <Stat label="RECEITAS" value={money(model.income)} good />
        <Stat label="DESPESAS" value={money(model.expense)} />
      </div>

      <section className="white-card chart-card">
        <SectionTitle title="Fluxo mensal" />
        <div className="bar-chart">
          {months.map((ym, i) => (
            <div className="bar-group" key={ym}>
              <div>
                <span className="bar income" style={{ height: `${(mockIncome[i] / max) * 108}px` }} />
                <span className="bar expense" style={{ height: `${(mockExpense[i] / max) * 108}px` }} />
              </div>
              <p>{MONTH_SHORT[Number(ym.split("-")[1]) - 1]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="white-card donut-card">
        <SectionTitle title="Gastos por categoria" />
        {categories.length ? <Donut categories={categories} total={model.expense} /> : <Empty title="Sem gastos no período" />}
      </section>

      <section className="block">
        <SectionTitle title="Maiores gastos" />
        {categories.map(item => (
          <article className="white-card budget-row compact" key={item.id}>
            <div className="row-head">
              <div className="row-main">
                <span className="icon-box"><Icon name={item.icon} /></span>
                <div>
                  <h3>{displayCategory(item.category)}</h3>
                  <p>{model.expense ? Math.round((item.value / model.expense) * 100) : 0}% do total</p>
                </div>
              </div>
              <strong>{money(item.value)}</strong>
            </div>
            <Progress value={model.expense ? Math.round((item.value / model.expense) * 100) : 0} color={item.color} />
          </article>
        ))}
      </section>
    </div>
  );
}

function Donut({ categories, total }) {
  let start = 0;
  const gradient = categories.map(item => {
    const pct = (item.value / total) * 100;
    const seg = `${item.color} ${start}% ${start + pct}%`;
    start += pct;
    return seg;
  }).join(", ");

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
        <div>
          <span>Gastos</span>
          <strong>{money(total).replace(",00", "")}</strong>
        </div>
      </div>
      <div className="legend">
        {categories.slice(0, 5).map(item => (
          <div key={item.id}>
            <i style={{ background: item.color }} />
            <span>{displayCategory(item.category)}</span>
            <b>{money(item.value)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Fixas (recurring bills + forecast) ──────────────────────────────────────

function Fixas({ model, openModal, onUpdate, onDelete }) {
  const [view, setView] = useState("list");
  const activeRecurring = model.recurring.filter(r => r.active);
  const totalMonthly = activeRecurring.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="screen">
      <header className="topbar simple">
        <h1>Contas Fixas</h1>
        <button className="round-button dark" onClick={() => openModal("recurring")} aria-label="Nova conta fixa">
          <Plus size={20} />
        </button>
      </header>

      <div className="recurring-summary">
        <p>TOTAL MENSAL</p>
        <h2>{money(totalMonthly)}</h2>
        <small>{activeRecurring.length} conta{activeRecurring.length !== 1 ? "s" : ""} ativa{activeRecurring.length !== 1 ? "s" : ""}</small>
      </div>

      <div className="tabs cols-2" style={{ margin: "0 20px 20px" }}>
        <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>Contas</button>
        <button className={view === "forecast" ? "active" : ""} onClick={() => setView("forecast")}>Previsão</button>
      </div>

      {view === "list" ? (
        <section className="block">
          {model.recurring.length === 0 && <Empty title="Nenhuma conta fixa cadastrada" />}
          {model.recurring.map(r => (
            <RecurringBillRow
              key={r.id}
              bill={r}
              onToggle={() => onUpdate(r.id, { ...r, active: !r.active })}
              onEdit={() => openModal("recurring", r)}
              onDelete={() => onDelete(r.id)}
            />
          ))}
        </section>
      ) : (
        <section className="block">
          <ForecastView recurring={activeRecurring} installments={model.installments || []} />
        </section>
      )}
    </div>
  );
}

function RecurringBillRow({ bill, onToggle, onEdit, onDelete }) {
  return (
    <article className="white-card recurring-row">
      <div className="row-head">
        <div className="row-main">
          <span className="icon-box" style={{ opacity: bill.active ? 1 : 0.4 }}>
            <Icon name={bill.icon} />
          </span>
          <div>
            <h3 className={bill.active ? "" : "inactive-label"}>{bill.name}</h3>
            <p>Dia {bill.dueDay} · {money(bill.amount)} · {bill.method}</p>
          </div>
        </div>
        <div className="row-actions">
          <button
            className={`toggle-btn${bill.active ? " on" : ""}`}
            onClick={onToggle}
            aria-label={bill.active ? "Desativar" : "Ativar"}
          />
          <button onClick={onEdit}><Pencil size={13} /></button>
          <button className="danger" onClick={onDelete}><Trash2 size={13} /></button>
        </div>
      </div>
    </article>
  );
}

function ForecastView({ recurring, installments }) {
  const months = Array.from({ length: 6 }, (_, i) => adjustMonth(todayYM(), i));

  return (
    <>
      {months.map(ym => {
        const activeInst = installments.filter(inst => {
          const idx = monthsBetween(inst.startMonth, ym);
          return idx >= 0 && idx < inst.totalInstallments;
        }).map(inst => ({ ...inst, num: monthsBetween(inst.startMonth, ym) + 1 }));

        const recurringTotal = recurring.reduce((s, r) => s + r.amount, 0);
        const installTotal = activeInst.reduce((s, i) => s + i.amountPerInstallment, 0);
        const total = recurringTotal + installTotal;

        return (
          <div className="forecast-card" key={ym}>
            <div className="forecast-header">
              <h3>{ymLabel(ym)}</h3>
              <strong>{money(total)}</strong>
            </div>

            {[...recurring].sort((a, b) => a.dueDay - b.dueDay).map(r => (
              <div className="forecast-item" key={r.id}>
                <Icon name={r.icon} size={15} />
                <span className="forecast-day">Dia {r.dueDay}</span>
                <span>{r.name}</span>
                <b>{money(r.amount)}</b>
              </div>
            ))}

            {activeInst.length > 0 && activeInst.map(inst => (
              <div className="forecast-item" key={inst.id}>
                <CreditCard size={15} />
                <span className="forecast-day" style={{ color: "#7c3aed" }}>{inst.num}/{inst.totalInstallments}x</span>
                <span>{inst.description}</span>
                <b>{money(inst.amountPerInstallment)}</b>
              </div>
            ))}

            {recurring.length === 0 && activeInst.length === 0 && <Empty title="Nenhuma conta ativa" />}
          </div>
        );
      })}
    </>
  );
}

// ─── Transaction modal ────────────────────────────────────────────────────────

function TransactionModal({ initialType, onClose, onSubmit }) {
  const { expenseCats, incomeCats } = useCategories();
  const [entry, setEntry] = useState({
    type: initialType,
    amount: "",
    category: initialType === "receita" ? "Salario" : "Alimentacao",
    description: "",
    method: "pix",
  });
  const [saving, setSaving] = useState(false);
  const categoryList = entry.type === "receita" ? incomeCats : expenseCats;

  function setType(type) {
    setEntry(e => ({ ...e, type, category: type === "receita" ? "Salario" : "Alimentacao" }));
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!entry.amount) return;
    const cat = categoryList.find(c => c.name === entry.category);
    setSaving(true);
    try {
      await onSubmit({
        ...entry,
        amount: Number(String(entry.amount).replace(",", ".")),
        description: entry.description || (cat?.label || entry.category),
        icon: cat?.icon || "Box",
      });
    } finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>{entry.type === "receita" ? "Nova Receita" : "Nova Despesa"}</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="segmented">
          <button type="button" className={entry.type === "despesa" ? "active" : ""} onClick={() => setType("despesa")}>Despesa</button>
          <button type="button" className={entry.type === "receita" ? "active green" : ""} onClick={() => setType("receita")}>Receita</button>
        </div>
        <label className="amount-field">
          <span>R$</span>
          <input inputMode="decimal" placeholder="0,00" value={entry.amount} onChange={ev => setEntry(e => ({ ...e, amount: ev.target.value }))} />
        </label>
        <label className="text-field">
          <input placeholder="Descrição (opcional)" value={entry.description} onChange={ev => setEntry(e => ({ ...e, description: ev.target.value }))} />
        </label>
        <p className="field-label">CATEGORIA</p>
        <CategoryPickerInline
          value={entry.category}
          onChange={cat => setEntry(e => ({ ...e, category: cat }))}
          type={entry.type === "receita" ? "income" : "expense"}
        />
        <p className="field-label">MÉTODO</p>
        <div className="method-grid">
          {methods.map(([v, l]) => (
            <button type="button" className={entry.method === v ? "active" : ""} onClick={() => setEntry(e => ({ ...e, method: v }))} key={v}>{l}</button>
          ))}
        </div>
        <button className="save-button" disabled={saving}>{saving ? "Salvando..." : "Salvar lançamento"}</button>
      </form>
    </div>
  );
}

// ─── Budget modal ─────────────────────────────────────────────────────────────

function BudgetModal({ budget, onClose, onSave, onDelete }) {
  const { allCats } = useCategories();
  const isEdit = !!budget?.id;
  const [form, setForm] = useState({
    category: budget?.category || "Alimentacao",
    limit: budget?.limit ?? "",
    icon: budget?.icon || "Utensils",
    color: budget?.color || BUDGET_COLORS[0],
  });
  const [saving, setSaving] = useState(false);

  function setCategory(cat) {
    const def = allCats.find(c => c.name === cat)?.icon || "Box";
    setForm(f => ({ ...f, category: cat, icon: def }));
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!form.limit) return;
    setSaving(true);
    try { await onSave({ ...form, limit: Number(String(form.limit).replace(",", ".")) }); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>{isEdit ? "Editar Orçamento" : "Novo Orçamento"}</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <p className="field-label">CATEGORIA</p>
        <CategoryPickerInline value={form.category} onChange={setCategory} type="expense" />

        <label className="amount-field">
          <span>R$</span>
          <input inputMode="decimal" placeholder="Limite mensal" value={form.limit} onChange={ev => setForm(f => ({ ...f, limit: ev.target.value }))} />
        </label>

        <p className="field-label">ÍCONE</p>
        <IconPicker value={form.icon} onChange={icon => setForm(f => ({ ...f, icon }))} />

        <p className="field-label">COR</p>
        <ColorPicker value={form.color} onChange={color => setForm(f => ({ ...f, color }))} colors={BUDGET_COLORS} />

        <div className="modal-actions">
          <button className="save-button" disabled={saving}>{saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar orçamento"}</button>
          {onDelete && <button type="button" className="delete-button" onClick={onDelete}>Excluir orçamento</button>}
        </div>
      </form>
    </div>
  );
}

// ─── Card modal ───────────────────────────────────────────────────────────────

function CardModal({ card, onClose, onSave, onDelete }) {
  const isEdit = !!card?.id;
  const [form, setForm] = useState({
    name: card?.name || "",
    brand: card?.brand || "Mastercard",
    last4: card?.last4 || "",
    limit: card?.limit ?? "",
    closingDay: card?.closingDay ?? "",
    dueDay: card?.dueDay ?? "",
    color: card?.color || CARD_COLORS[0],
  });
  const [saving, setSaving] = useState(false);

  async function submit(ev) {
    ev.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        limit: Number(form.limit),
        closingDay: Number(form.closingDay),
        dueDay: Number(form.dueDay),
      });
    } finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>{isEdit ? "Editar Cartão" : "Novo Cartão"}</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="text-field">
          <input required placeholder="Nome do cartão (ex: Nubank)" value={form.name} onChange={ev => setForm(f => ({ ...f, name: ev.target.value }))} />
        </div>

        <div className="text-field">
          <select value={form.brand} onChange={ev => setForm(f => ({ ...f, brand: ev.target.value }))}>
            {["Mastercard", "Visa", "Elo", "Amex", "Hipercard"].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>

        <div className="text-field">
          <input required inputMode="numeric" maxLength={4} placeholder="4 últimos dígitos" value={form.last4} onChange={ev => setForm(f => ({ ...f, last4: ev.target.value.replace(/\D/g, "").slice(0, 4) }))} />
        </div>

        <label className="amount-field">
          <span>R$</span>
          <input required inputMode="decimal" placeholder="Limite do cartão" value={form.limit} onChange={ev => setForm(f => ({ ...f, limit: ev.target.value }))} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div className="text-field" style={{ marginBottom: 0 }}>
            <input required inputMode="numeric" placeholder="Dia fechamento" value={form.closingDay} onChange={ev => setForm(f => ({ ...f, closingDay: ev.target.value }))} />
          </div>
          <div className="text-field" style={{ marginBottom: 0 }}>
            <input required inputMode="numeric" placeholder="Dia vencimento" value={form.dueDay} onChange={ev => setForm(f => ({ ...f, dueDay: ev.target.value }))} />
          </div>
        </div>

        <p className="field-label">COR DO CARTÃO</p>
        <ColorPicker value={form.color} onChange={color => setForm(f => ({ ...f, color }))} colors={CARD_COLORS} />

        <div className="modal-actions">
          <button className="save-button" disabled={saving}>{saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar cartão"}</button>
          {onDelete && <button type="button" className="delete-button" onClick={onDelete}>Excluir cartão</button>}
        </div>
      </form>
    </div>
  );
}

// ─── Recurring modal ──────────────────────────────────────────────────────────

function RecurringModal({ bill, onClose, onSave, onDelete }) {
  const isEdit = !!bill?.id;
  const [form, setForm] = useState({
    name: bill?.name || "",
    amount: bill?.amount ?? "",
    category: bill?.category || "Moradia",
    icon: bill?.icon || "House",
    dueDay: bill?.dueDay ?? "",
    method: bill?.method || "pix",
    active: bill?.active ?? true,
    color: bill?.color || BUDGET_COLORS[0],
  });
  const [saving, setSaving] = useState(false);
  const { allCats } = useCategories();

  function setCategory(cat) {
    const def = allCats.find(c => c.name === cat)?.icon || "Box";
    setForm(f => ({ ...f, category: cat, icon: def }));
  }

  async function submit(ev) {
    ev.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        amount: Number(String(form.amount).replace(",", ".")),
        dueDay: Number(form.dueDay),
      });
    } finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>{isEdit ? "Editar Conta Fixa" : "Nova Conta Fixa"}</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="text-field">
          <input required placeholder="Nome da conta (ex: Aluguel)" value={form.name} onChange={ev => setForm(f => ({ ...f, name: ev.target.value }))} />
        </div>

        <label className="amount-field">
          <span>R$</span>
          <input required inputMode="decimal" placeholder="Valor mensal" value={form.amount} onChange={ev => setForm(f => ({ ...f, amount: ev.target.value }))} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div className="text-field" style={{ marginBottom: 0 }}>
            <input required inputMode="numeric" placeholder="Dia venc." value={form.dueDay} onChange={ev => setForm(f => ({ ...f, dueDay: ev.target.value }))} />
          </div>
          <div className="text-field" style={{ marginBottom: 0 }}>
            <select value={form.method} onChange={ev => setForm(f => ({ ...f, method: ev.target.value }))}>
              {methods.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <p className="field-label">CATEGORIA</p>
        <CategoryPickerInline value={form.category} onChange={setCategory} type="expense" />

        <p className="field-label">ÍCONE</p>
        <IconPicker value={form.icon} onChange={icon => setForm(f => ({ ...f, icon }))} />

        <p className="field-label">COR</p>
        <ColorPicker value={form.color} onChange={color => setForm(f => ({ ...f, color }))} colors={BUDGET_COLORS} />

        <div className="modal-actions">
          <button className="save-button" disabled={saving}>{saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar conta fixa"}</button>
          {onDelete && <button type="button" className="delete-button" onClick={onDelete}>Excluir conta fixa</button>}
        </div>
      </form>
    </div>
  );
}

// ─── Installment modal ────────────────────────────────────────────────────────

function InstallmentModal({ cardId, cards, onClose, onSave }) {
  const [mode, setMode] = useState("new");
  const [form, setForm] = useState({
    cardId: cardId || cards[0]?.id || "",
    description: "",
    category: "Outros",
    icon: "CreditCard",
    amountPerInstallment: "",
    totalInstallments: "",
    startMonth: todayYM(),
  });
  const [saving, setSaving] = useState(false);

  async function submit(ev) {
    ev.preventDefault();
    if (!form.amountPerInstallment || !form.totalInstallments || !form.description) return;
    setSaving(true);
    try {
      await onSave({
        cardId: form.cardId,
        description: form.description,
        category: form.category,
        icon: form.icon,
        amountPerInstallment: Number(String(form.amountPerInstallment).replace(",", ".")),
        totalInstallments: Number(form.totalInstallments),
        startMonth: form.startMonth,
      });
    } finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>Nova Parcela</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="segmented">
          <button type="button" className={mode === "new" ? "active" : ""} onClick={() => setMode("new")}>Nova compra</button>
          <button type="button" className={mode === "existing" ? "active" : ""} onClick={() => { setMode("existing"); setForm(f => ({ ...f, startMonth: todayYM() })); }}>Dívida existente</button>
        </div>

        <div className="text-field">
          <input required placeholder="Descrição (ex: iPhone 15 Pro)" value={form.description} onChange={ev => setForm(f => ({ ...f, description: ev.target.value }))} />
        </div>

        <label className="amount-field">
          <span>R$</span>
          <input required inputMode="decimal" placeholder={mode === "existing" ? "Valor de cada parcela restante" : "Valor de cada parcela"} value={form.amountPerInstallment} onChange={ev => setForm(f => ({ ...f, amountPerInstallment: ev.target.value }))} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: mode === "new" ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 14 }}>
          <div className="text-field" style={{ marginBottom: 0 }}>
            <input required inputMode="numeric" placeholder={mode === "existing" ? "Parcelas restantes" : "Nº de parcelas"} value={form.totalInstallments} onChange={ev => setForm(f => ({ ...f, totalInstallments: ev.target.value.replace(/\D/g, "") }))} />
          </div>
          {mode === "new" && (
            <div className="text-field" style={{ marginBottom: 0 }}>
              <select value={form.startMonth} onChange={ev => setForm(f => ({ ...f, startMonth: ev.target.value }))}>
                {Array.from({ length: 3 }, (_, i) => adjustMonth(todayYM(), i)).map(ym => (
                  <option key={ym} value={ym}>{ymShort(ym)}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <p className="field-label">CATEGORIA</p>
        <CategoryPickerInline value={form.category} onChange={cat => setForm(f => ({ ...f, category: cat }))} type="expense" />

        {cards.length > 1 && (
          <>
            <p className="field-label">CARTÃO</p>
            <div className="text-field">
              <select value={form.cardId} onChange={ev => setForm(f => ({ ...f, cardId: ev.target.value }))}>
                {cards.map(c => <option key={c.id} value={c.id}>{c.name} ····{c.last4}</option>)}
              </select>
            </div>
          </>
        )}

        <button className="save-button" disabled={saving}>{saving ? "Salvando..." : "Adicionar parcelamento"}</button>
      </form>
    </div>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")).render(<App />);
