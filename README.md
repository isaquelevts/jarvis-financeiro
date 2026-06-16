# Jarvis Financeiro

Webapp React com API Node/Express e banco PostgreSQL, implementado a partir do handoff do Claude Design.

## Como rodar localmente

1. Copie `.env.example` para `.env`.
2. Suba o PostgreSQL:

```bash
docker compose up -d
```

3. Instale dependencias:

```bash
npm install
```

4. Crie as tabelas e dados iniciais:

```bash
npm run db:migrate
npm run db:seed
```

5. Inicie API e webapp:

```bash
npm run dev
```

Webapp: `http://localhost:5173`
API: `http://localhost:3333/api`
