# PiNa — Gestão de Campanhas e Tarefas

Aplicação React para gerenciamento de empresas clientes, tarefas e campanhas de marketing.

## 🚀 Como rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📁 Estrutura de pastas

```
PiNa/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx         # Barra de navegação superior
│   │   ├── Sidebar.jsx        # Menu lateral (Dashboard)
│   │   ├── EmpresaCard.jsx    # Card de empresa
│   │   └── TarefaCard.jsx     # Card de tarefa (kanban)
│   ├── data/
│   │   └── mockData.js        # Dados mockados
│   ├── pages/
│   │   ├── Empresas.jsx       # Listagem de empresas
│   │   ├── Tarefas.jsx        # Kanban de tarefas
│   │   └── Dashboard.jsx      # Dashboard de marketing
│   ├── App.jsx                # Roteamento interno
│   ├── index.css              # Estilos globais + Tailwind
│   └── main.jsx               # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🛠 Tecnologias

- **React 18** + JSX
- **Tailwind CSS v3**
- **Recharts** — gráficos do dashboard
- **Vite** — bundler

## 📄 Páginas

| Página | Rota interna | Descrição |
|--------|-------------|-----------|
| Empresas | estado inicial | Grid de empresas gerenciadas |
| Tarefas | após clicar na empresa | Kanban com 3 colunas |
| Dashboard | botão "Ver Dashboard" | Métricas, gráficos e atividades |
