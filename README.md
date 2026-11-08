# Feira. — Marketplace

> **Teste técnico Full Stack de e-commerce.** Este projeto foi desenvolvido para demonstrar decisões de arquitetura, organização, validação, segurança básica e testes em um fluxo realista de compras.

## Sobre o projeto

O desafio original propõe uma loja virtual com catálogo, carrinho e checkout. A aplicação implementa esse fluxo e o amplia com oficinas reserváveis: produtos físicos usam estoque; oficinas usam vagas por sessão.

O checkout aceita produtos e reservas na mesma compra. Preços e disponibilidade são conferidos no servidor, e o pedido é persistido antes do envio da confirmação por e-mail.

### Funcionalidades

- Catálogo de produtos físicos com busca, paginação e indicação de estoque.
- Catálogo de oficinas com sessões, duração, local, preço por participante e vagas disponíveis.
- Carrinho com produtos e reservas, alteração de quantidades e remoção de itens.
- Checkout com validação de nome e e-mail.
- Administração de produtos, oficinas e sessões.
- Histórico e confirmação do pedido.
- Confirmação por e-mail via Resend, ou simulação no log quando não há chave configurada.

### Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, TanStack Query, React Hook Form, Zod, Tailwind CSS e DaisyUI |
| Backend | Node.js, NestJS, TypeScript, TypeORM, class-validator, helmet, Resend |
| Banco de dados | MySQL 8 |
| Testes | Vitest; testes de integração/concurrency com MySQL e teste HTTP do NestJS |

## Pré-requisitos

- Node.js **20.9 ou superior** e npm.
- MySQL **8.x** em execução localmente.
- Acesso à internet para baixar dependências.

O projeto não depende de Docker. Os comandos abaixo assumem que os terminais estão na raiz do repositório, `marketplace`.

## Configuração do MySQL

Instale e inicie o MySQL Community Server 8.x (ou uma instalação compatível). O MySQL Workbench ou o cliente `mysql` podem ser usados para executar os comandos SQL abaixo.

Crie um banco local vazio para a aplicação:

```sql
CREATE DATABASE marketplace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Configure um usuário local com acesso ao banco. Para executar os testes E2E de concorrência, ele também precisa poder criar e remover bancos temporários:

```sql
CREATE USER 'marketplace_user'@'localhost' IDENTIFIED BY 'defina_uma_senha_local';
GRANT ALL PRIVILEGES ON marketplace.* TO 'marketplace_user'@'localhost';

-- Necessário somente se este usuário for executar o teste E2E de concorrência.
-- Concede permissões de criação/remoção de bancos; use apenas localmente.
GRANT CREATE, DROP ON *.* TO 'marketplace_user'@'localhost';
```

Use os mesmos valores de usuário e senha nas variáveis `DB_USERNAME` e `DB_PASSWORD`. **Não use credenciais de produção para os testes.**

> A primeira configuração deve usar um banco vazio. Se você já tem um banco com tabelas/dados, faça backup e confira o estado das migrations antes de executar qualquer migration; não aplique as instruções de banco vazio sobre um banco existente sem essa revisão.

## Variáveis de ambiente

### Backend

Crie `backend/.env` a partir do exemplo:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edite `backend/.env` com os valores locais:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_DATABASE=marketplace

PORT=3001
FRONTEND_URL=http://localhost:3000

| Variável | Necessária? | Uso |
|---|---:|---|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Sim | Conexão com MySQL. `DB_PORT` deve ser uma porta numérica válida. |
| `PORT` | Recomendado | Porta da API; use `3001` para coincidir com o frontend local. |
| `FRONTEND_URL` | Sim | Origem HTTP(S) exata autorizada pelo CORS, sem caminho (por exemplo, `http://localhost:3000`). |
| `RESEND_API_KEY` | Sim | Chave do Resend para envio real de e-mails. Se omitida, o backend simula o envio nos logs. |
| `MAIL_FROM` | Sim | Remetente usado no envio pelo Resend; configure um remetente permitido pela sua conta. |

As variáveis `OBSERVE_APP_KEY` e `OBSERVE_APP_SECRET` presentes no arquivo de exemplo não são necessárias para iniciar o fluxo local descrito aqui.

### Frontend

Por padrão, o frontend chama `http://localhost:3001`. Para usar outra URL, crie `frontend/.env.local` e configure:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Se mudar a porta ou o endereço do frontend, atualize também `FRONTEND_URL` no backend. Use `localhost` nos dois endereços para que o cookie do carrinho funcione como esperado.

## Instalação e execução

### 1. Instale as dependências

Em um terminal:

```powershell
cd backend
npm install
```

Em outro terminal:

```powershell
cd frontend
npm install
```

### 2. Aplique as migrations e crie os dados de exemplo

No terminal do backend:

```powershell
npm run migration:run
npm run seed
```

As migrations criam a estrutura do banco. A aplicação também está configurada para executar migrations pendentes ao iniciar. O seed inclui produtos físicos e sete oficinas com sessões futuras; ele evita duplicar os dados de exemplo em execuções subsequentes.

Ao alterar entidades ou o schema, gere uma **nova** migration e revise o SQL antes de aplicá-la:

```powershell
cd backend
npx typeorm-ts-node-esm migration:generate src/migrations/NomeDaAlteracao -d src/data-source.ts
npm run migration:run
```

Não reescreva migrations já aplicadas. Em bancos com dados existentes, faça backup e revise a migration antes de executar.

### 3. Inicie os servidores

No terminal do backend:

```powershell
npm run start:dev
```

No terminal do frontend:

```powershell
npm run dev
```

Abra <http://localhost:3000>. A API fica em <http://localhost:3001>.

## Rotas da aplicação

| Rota | Conteúdo |
|---|---|
| `/` | Catálogo de produtos físicos |
| `/oficinas` | Catálogo de oficinas e sessões |
| `/carrinho` | Itens, quantidades e checkout |
| `/pedido-confirmado` | Resumo da compra confirmada |
| `/pedidos` | Consulta de pedidos |
| `/admin` | Administração de produtos |
| `/admin/oficinas` | Administração de oficinas e sessões |

### Endpoints principais da API

| Método | Endpoint | Finalidade |
|---|---|---|
| `GET` | `/produtos?page=1&limit=5&type=physical&q=termo` | Listar, paginar e buscar produtos |
| `POST`, `PUT` | `/carrinho` | Adicionar ou atualizar/remover itens |
| `GET` | `/carrinho` | Consultar o carrinho associado ao cookie |
| `POST` | `/finalizar-compra` | Confirmar pedido e registrar a venda |
| `GET` | `/oficinas?page=1&limit=5` | Listar oficinas e sessões disponíveis |
| `POST`, `PUT` | `/oficinas` e `/oficinas/:id` | Criar e atualizar oficinas |
| `POST`, `GET`, `PUT`, `DELETE` | `/oficinas/:id/sessoes` e `/oficinas/sessoes/:sessionId` | Consultar e administrar sessões |

## Testes e verificações

Execute os comandos na pasta indicada.

### Testes unitários — backend

```powershell
cd backend
npm test
```

### Teste HTTP do NestJS e testes E2E de concorrência

```powershell
cd backend
npm run test:e2e
```

O teste de concorrência em `src/order/order.concurrency.e2e-spec.ts` usa MySQL real: cria um banco temporário com nome aleatório, aplica as migrations e o remove ao terminar. O usuário MySQL configurado em `backend/.env` precisa ter permissão de `CREATE DATABASE` e `DROP DATABASE`. O teste HTTP em `test/app.e2e-spec.ts` inicializa a aplicação usando o banco configurado, e a API executa migrations pendentes na inicialização; use um banco local/de teste isolado. **Não rode esse comando contra produção.**

O teste de concorrência é um destaque do projeto:

- Dispara **20 checkouts simultâneos** para a última unidade de um produto físico e verifica que somente um é concluído.
- Dispara **20 checkouts simultâneos** para a última vaga de uma sessão de oficina, incluindo um produto físico no mesmo carrinho, e verifica que somente uma reserva é confirmada.
- Confere conflitos para as demais tentativas e a consistência de estoque, vagas, pedidos e itens.

### Build e lint

```powershell
# Backend
cd backend
npm run build
npm run lint

# Frontend
cd frontend
npm run build
npm run lint
```

## Decisões e limitações conhecidas

- **Integridade de estoque e vagas:** o checkout revalida disponibilidade e persiste o pedido em transação; as atualizações condicionais impedem vender estoque ou vagas além do limite em requisições concorrentes.
- **Preço confiável:** o total é calculado no backend com os preços atuais do banco, não com valores enviados pelo navegador.
- **Carrinho:** os itens ficam em memória na API e são associados a um cookie `httpOnly`, `SameSite=Lax`, com validade de 24 horas. Reiniciar a API limpa os carrinhos; várias instâncias não compartilham esse estado.
- **Pagamento:** o desafio não inclui integração com gateway nem pagamento real.
- **Autenticação:** não há login; o checkout identifica o cliente pelo nome e e-mail.
- **E-mail:** sem `RESEND_API_KEY`, o envio é simulado no log; com Resend configurado, o remetente precisa ser aceito pela conta.
- **Ambiente E2E:** os testes de concorrência precisam de MySQL disponível e permissões para criar/remover o banco temporário.
