# Gestão da Ação Social — Fonte de Água da Vida

Sistema web de gestão da ação social da **Igreja Assembleia de Deus Madureira Fonte de Água da
Vida**, bairro São João, Araguaína/TO. Substitui os cadernos de papel no registro de famílias
assistidas, atendimentos, entrega de cestas básicas e acolhimentos da casa de apoio.

Projeto da **Atividade Extensionista II — Tecnologia Aplicada à Inclusão Digital**.

## Tecnologias

| Camada | Escolha |
| --- | --- |
| Front-end | React 19, Vite 7, TypeScript |
| Estilo | Tailwind CSS 4 |
| Dados e API | Supabase (PostgreSQL + PostgREST) |
| Autenticação | Supabase Auth (JWT) com Row Level Security |
| Estado servidor | TanStack Query |
| Ícones | Material Design Icons (Iconify) e Lucide |
| Tipografia | Bricolage Grotesque e Lexend (Google Fonts) |
| Hospedagem | Vercel |

## Funcionalidades

- **Painel** — famílias ativas, atendimentos e cestas do mês, estoque, últimos atendimentos e
  quem está na casa de apoio agora, com alerta de estoque baixo.
- **Famílias assistidas** — cadastro com busca, composição familiar e situação; página de
  detalhe com histórico completo de atendimentos e cestas recebidas.
- **Atendimentos** — registro por família, tipo de ajuda, descrição e encaminhamento, com
  filtro por período.
- **Cestas básicas** — entradas por doação, saídas por entrega e saldo em estoque calculado
  automaticamente; bloqueia entrega sem estoque.
- **Casa de apoio** — acolhimentos com entrada, saída e contagem de dias.
- **Voluntários** — obreiros, músicos e colaboradores da ação social.
- **Relatórios** — resumo por período, distribuição por tipo de ajuda, detalhamento por
  família, impressão e exportação em planilha (CSV).

## Perfis de acesso

O primeiro usuário cadastrado vira **liderança** automaticamente; os demais entram como
**voluntário**. Voluntários leem e registram; apenas a liderança exclui registros — regra
aplicada no banco por Row Level Security, não apenas na interface.

## Acessibilidade

Pensada para voluntários com pouca familiaridade digital: fonte base de 17px, alvos de toque de
no mínimo 48px, contraste alto, foco visível em todos os controles, rótulos em linguagem
simples, atalho "ir para o conteúdo" e respeito a `prefers-reduced-motion`.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev
```

Variáveis necessárias:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publishable
```

A chave publishable é pública por design — o que protege os dados são as políticas de Row Level
Security definidas em `supabase/schema.sql`.

## Banco de dados

O arquivo [`supabase/schema.sql`](supabase/schema.sql) cria tabelas, índices, a view de estoque,
o gatilho que cria o perfil no cadastro e todas as políticas de segurança. Aplique pelo SQL
Editor do Supabase ou pelo script auxiliar:

```bash
npm install pg
SENHA_SUPABASE="sua-senha-do-banco" node supabase/aplicar-schema.mjs
```

## Deploy

Com um token da Vercel que tenha permissão de criar projetos:

```bash
npx vercel --prod
```

Ou pelo script de API em `scripts/deploy-vercel.mjs`:

```bash
npm run build
VERCEL_TOKEN="seu-token" node scripts/deploy-vercel.mjs
```

Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente do projeto na
Vercel, ou mantenha o arquivo `.env.production`.

## Estrutura

```
src/
├── componentes/   Layout, marca, ícones e blocos de interface
├── contexto/      Autenticação com Supabase
├── dados/         Consultas e mutações com TanStack Query
├── lib/           Cliente Supabase e utilitários de formatação
├── paginas/       Uma página por módulo do sistema
└── tipos.ts       Tipos do domínio
supabase/
├── schema.sql            Tabelas, políticas, view e gatilhos
└── aplicar-schema.mjs    Aplicação do schema via conexão direta
```

## Logo

Coloque o arquivo da logo da igreja em `public/logo.png`. Sem ele, o sistema exibe uma marca
alternativa gerada com as cores da identidade visual.
