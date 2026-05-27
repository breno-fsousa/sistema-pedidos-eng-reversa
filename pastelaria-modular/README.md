# 🍴 Pastelaria do Zé — Arquitetura Modular

## 🎓 Disciplina
**Arquitetura de Sistemas**  
**Professor:** Dr. Renato William Rodrigues de Souza  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Instituição:** IFCE — Campus Boa Viagem  
**Atividade:** Prática Orientada 06 — Refatoração de MVC para Arquitetura Modular

---

## Estrutura do Projeto

```
/
├── index.html                            ← Ponto de entrada
├── package.json                          ← Scripts e dependências
├── db/
│   └── db.json                           ← JSON Server (pedidos + pagamentos)
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── entities/     Usuario.js
│   │   │   ├── repositories/ AuthRepository.js
│   │   │   ├── services/     AuthService.js
│   │   │   └── controllers/  AuthController.js
│   │   ├── orders/
│   │   │   ├── entities/     ItemPedido.js, Pedido.js
│   │   │   ├── repositories/ OrderRepository.js
│   │   │   ├── services/     OrderService.js
│   │   │   └── controllers/  OrderController.js
│   │   ├── products/
│   │   │   ├── entities/     Produto.js
│   │   │   ├── repositories/ ProductRepository.js
│   │   │   ├── services/     ProductService.js
│   │   │   └── controllers/  ProductController.js
│   │   └── payments/
│   │       ├── entities/     Pagamento.js
│   │       ├── repositories/ PaymentRepository.js
│   │       ├── services/     PaymentService.js (Strategy)
│   │       └── controllers/  PaymentController.js
│   ├── shared/
│   │   ├── config/       AppConfig.js      ← Singleton
│   │   ├── utils/        EventBus.js, Logger.js, Formatters.js
│   │   └── middlewares/  AuthMiddleware.js, ErrorHandler.js
│   └── views/
│       ├── PedidoView.js                  ← Única camada com DOM
│       └── style.css
├── tests/
│   ├── modular.test.js                    ← 45+ testes unitários
│   └── runner.html                        ← Executor visual no browser
├── diagramas/
│   └── diagrama-modulos.md               ← Diagramas de módulos e fluxos
└── docs/
    ├── analise.md                         ← Partes 1 e 7
    ├── comparacao.md                      ← Parte 8
    ├── modularizacao.md                   ← Partes 3 e 6
    └── equipe.md                          ← Parte 11
```

---

## Como Executar

### 1. Abrir o sistema
```bash
# Abrir index.html diretamente no navegador
# Login: admin/1234  ou  atendente/1234
```

### 2. Rodar a API fake (JSON Server)
```bash
npm install
npm run api
# http://localhost:3000/pedidos
# http://localhost:3000/pagamentos
```

### 3. Rodar os testes
```bash
# Terminal
npm test

# Navegador: abrir tests/runner.html
```

---

## Commits Obrigatórios (Parte 13)

```bash
git checkout -b arquitetura-modular

git add src/shared/
git commit -m "Separacao da camada shared com EventBus, Logger e AppConfig"

git add src/modules/orders/
git commit -m "Separacao do modulo de pedidos"

git add src/modules/products/
git commit -m "Criacao do modulo de produtos"

git add src/modules/payments/
git commit -m "Criacao da camada de services com Strategy de desconto"

git add src/modules/orders/repositories/ src/modules/payments/repositories/
git commit -m "Aplicacao do repository pattern"

git add src/modules/orders/controllers/ src/modules/products/controllers/
git commit -m "Refatoracao dos controllers"

git add src/shared/middlewares/
git commit -m "Criacao do middleware global de auth e erros"

git add src/modules/auth/
git commit -m "Implementacao do modulo de autenticacao fake"

git add tests/
git commit -m "Testes unitarios para arquitetura modular"

git add docs/ diagramas/ README.md
git commit -m "Documentacao e analise arquitetural completa"
```

---

## Padrões de Projeto Implementados

| Padrão        | Onde                                      | Justificativa                                                       |
|---------------|-------------------------------------------|---------------------------------------------------------------------|
| **Factory**   | `ProductService.criarProduto()`           | Criação padronizada de Produto a partir do catálogo                 |
| **Singleton** | `AppConfig`, `EventBus`, `Logger`, `OrderRepository`, `ProductRepository`, `PaymentRepository`, `AuthRepository`, `ErrorHandler` | Instância única controlando estado global |
| **Repository**| `OrderRepository`, `ProductRepository`, `PaymentRepository`, `AuthRepository` | Abstração completa do acesso a dados |
| **Strategy**  | `PaymentService` + estratégias de desconto | Algoritmos de desconto intercambiáveis sem if/else |
| **Observer**  | `EventBus` + todos os controllers e View  | Comunicação desacoplada entre módulos via eventos |
| **Middleware**| `AuthMiddleware`, `ErrorHandler`           | Interceptação de requisições antes dos controllers |

---

## Funcionalidades Mantidas (Não removidas)

- ✔ Adição e remoção de itens do pedido
- ✔ Cálculo de subtotal, desconto por faixa e taxa de serviço
- ✔ Finalização de pedido com modal de resumo
- ✔ Envio via WhatsApp para cliente e estabelecimento
- ✔ Persistência local (localStorage) com recuperação de sessão
- ✔ Envio para API fake (JSON Server)
- ✔ Toast de notificações e feedback visual

## Funcionalidades Novas (Desafio Extra — Parte 10)

- ✔ **Login/logout** com autenticação fake (admin e atendente)
- ✔ **Log centralizado** com painel visual no rodapé
- ✔ **Tratamento global de erros** classificados por tipo
- ✔ **Observer cross-módulo** (PaymentController reage ao PEDIDO_FINALIZADO)
- ✔ **45+ testes unitários** cobrindo todos os módulos

---

## Documentação Adicional

| Arquivo                  | Conteúdo                                              |
|--------------------------|-------------------------------------------------------|
| `docs/analise.md`        | Engenharia reversa do MVC + problemas encontrados     |
| `docs/comparacao.md`     | Tabela comparativa MVC vs Modular                     |
| `docs/modularizacao.md`  | Organização dos módulos + tabela de migração          |
| `docs/equipe.md`         | Simulação de backlog, sprint, issues e PRs            |
| `diagramas/diagrama-modulos.md` | Diagrama de módulos, fluxos e classes          |

---

*"Uma arquitetura evolui conforme o sistema cresce. Organizar o código é organizar o futuro do projeto."*
