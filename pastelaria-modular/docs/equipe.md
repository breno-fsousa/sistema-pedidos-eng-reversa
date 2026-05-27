# 👥 Organização da Equipe — Simulação de Projeto Real

## Parte 11 — Jira / Backlog / Sprint / Issues / Pull Requests

---

## Contexto

Simulação de como a equipe de desenvolvimento utilizaria ferramentas de gestão
(Jira, GitHub Projects ou similar) para organizar o trabalho de refatoração
do MVC para Arquitetura Modular.

---

## Backlog do Projeto

| ID     | Título                                              | Tipo    | Prioridade | Responsável    |
|--------|-----------------------------------------------------|---------|------------|----------------|
| MOD-01 | Criar estrutura base de pastas da arquitetura modular | Task  | Alta       | Dev Backend    |
| MOD-02 | Separar módulo de produtos (`/products`)            | Story   | Alta       | Dev Backend    |
| MOD-03 | Separar módulo de pedidos (`/orders`)               | Story   | Alta       | Dev Backend    |
| MOD-04 | Criar módulo de pagamentos com Strategy de desconto | Story   | Alta       | Dev Backend    |
| MOD-05 | Implementar módulo de autenticação fake (`/auth`)   | Story   | Média      | Dev Backend    |
| MOD-06 | Criar camada `shared` com EventBus, Logger, Config  | Task    | Alta       | Dev Fullstack  |
| MOD-07 | Implementar middleware de autenticação              | Task    | Média      | Dev Backend    |
| MOD-08 | Implementar ErrorHandler global                     | Task    | Média      | Dev Backend    |
| MOD-09 | Atualizar View para trabalhar com múltiplos módulos | Task    | Média      | Dev Frontend   |
| MOD-10 | Escrever testes unitários para todos os módulos     | Task    | Alta       | QA / Dev       |
| MOD-11 | Criar documentação de análise arquitetural          | Task    | Média      | Tech Lead      |
| MOD-12 | Criar diagrama de módulos e fluxo arquitetural      | Task    | Baixa      | Tech Lead      |
| MOD-13 | Configurar JSON Server com rotas de pedidos e pagamentos | Task | Baixa   | Dev Fullstack  |
| MOD-14 | Code review e ajustes finais                        | Review  | Alta       | Equipe toda    |

---

## Sprint 1 — Estrutura e Módulos Principais (1 semana)

**Meta:** Ter os módulos `products`, `orders` e `shared` funcionando.

| ID     | Título                                              | Status      | Pontos |
|--------|-----------------------------------------------------|-------------|--------|
| MOD-01 | Criar estrutura base de pastas                      | ✅ Concluído | 1      |
| MOD-06 | Criar camada shared (EventBus, Logger, AppConfig)   | ✅ Concluído | 3      |
| MOD-02 | Separar módulo de produtos                          | ✅ Concluído | 3      |
| MOD-03 | Separar módulo de pedidos                           | ✅ Concluído | 5      |
| MOD-10 | Testes unitários (products + orders)                | ✅ Concluído | 3      |

**Total: 15 pontos | Velocidade estimada: 15 pts/sprint**

---

## Sprint 2 — Pagamentos, Auth e Middlewares (1 semana)

**Meta:** Ter autenticação, pagamentos e tratamento de erros funcionando.

| ID     | Título                                              | Status      | Pontos |
|--------|-----------------------------------------------------|-------------|--------|
| MOD-04 | Módulo de pagamentos com Strategy                   | ✅ Concluído | 5      |
| MOD-05 | Módulo de autenticação fake                         | ✅ Concluído | 3      |
| MOD-07 | Middleware de autenticação                          | ✅ Concluído | 3      |
| MOD-08 | ErrorHandler global                                 | ✅ Concluído | 2      |
| MOD-09 | Atualizar View para múltiplos módulos               | ✅ Concluído | 3      |
| MOD-10 | Testes (payments + auth + shared)                   | ✅ Concluído | 3      |

**Total: 19 pontos**

---

## Sprint 3 — Documentação e Entrega (3 dias)

**Meta:** Documentação completa e entrega acadêmica.

| ID     | Título                                              | Status      | Pontos |
|--------|-----------------------------------------------------|-------------|--------|
| MOD-11 | Documentação de análise arquitetural                | ✅ Concluído | 3      |
| MOD-12 | Diagramas de módulos e fluxo                        | ✅ Concluído | 2      |
| MOD-13 | JSON Server com rotas de pedidos e pagamentos       | ✅ Concluído | 1      |
| MOD-14 | Code review final e ajustes                         | ✅ Concluído | 2      |

**Total: 8 pontos**

---

## Issues Criadas no GitHub

### Issue #1 — MOD-02: Separar módulo de produtos

```
Título: [MOD-02] Criar módulo /products com entities, repository e service

Descrição:
  Mover a classe Produto de /models para /modules/products/entities.
  Criar ProductRepository isolando o acesso ao catálogo.
  Criar ProductService como ponto único de acesso ao módulo.

Critérios de aceite:
  - [ ] Produto.js em /modules/products/entities/
  - [ ] ProductRepository com listarTodos() e buscarPorId()
  - [ ] ProductService com criarProduto() e listarPorCategoria()
  - [ ] Testes passando para o módulo products

Labels: feature, architecture, sprint-1
Responsável: @dev-backend
```

---

### Issue #2 — MOD-04: Módulo de pagamentos com Strategy

```
Título: [MOD-04] Criar módulo /payments com regras de desconto (Strategy)

Descrição:
  Mover DescontoService do MVC para /modules/payments/services.
  Implementar as três estratégias de desconto como classes separadas.
  Criar PaymentService como fachada pública do módulo.
  PaymentController deve reagir ao evento PEDIDO_FINALIZADO via EventBus.

Critérios de aceite:
  - [ ] SemDescontoStrategy, DescontoMedioStrategy, DescontoAltoStrategy
  - [ ] DescontoStrategySelector selecionando via AppConfig
  - [ ] PaymentService.calcularDesconto() como API estática
  - [ ] PaymentController ouvindo PEDIDO_FINALIZADO
  - [ ] Testes cobrindo todas as fronteiras de desconto

Labels: feature, architecture, payments, sprint-2
Responsável: @dev-backend
```

---

### Issue #3 — MOD-06: Camada shared (EventBus, Logger, AppConfig)

```
Título: [MOD-06] Criar camada /shared com recursos transversais

Descrição:
  Mover EventBus de /services para /shared/utils.
  Criar Logger centralizado com histórico em memória.
  Criar AppConfig Singleton com todas as configurações do sistema.
  Criar Formatters com funções puras de formatação.

Critérios de aceite:
  - [ ] AppConfig Singleton retornando configurações corretas
  - [ ] EventBus compartilhado entre todos os módulos
  - [ ] Logger registrando INFO, WARN e ERROR com timestamp
  - [ ] Formatters com moeda(), dataHora(), gerarId(), truncar()

Labels: infrastructure, shared, sprint-1
Responsável: @dev-fullstack
```

---

### Issue #4 — MOD-07 + MOD-08: Middlewares de auth e erro

```
Título: [MOD-07/08] Implementar AuthMiddleware e ErrorHandler

Descrição:
  Criar AuthMiddleware para interceptar ações antes dos controllers.
  Criar ErrorHandler global para centralizar tratamento de erros.
  Ambos devem usar o EventBus para notificar a View.

Critérios de aceite:
  - [ ] AuthMiddleware.proteger() bloqueando ações sem sessão
  - [ ] AuthMiddleware.login() com credenciais fake
  - [ ] ErrorHandler.tratar() classificando por tipo (VALIDACAO, NEGOCIO, REDE)
  - [ ] ErrorHandler.executar() envolvendo funções assíncronas

Labels: security, middleware, sprint-2
Responsável: @dev-backend
```

---

### Issue #5 — MOD-10: Testes unitários de todos os módulos

```
Título: [MOD-10] Escrever testes unitários para arquitetura modular

Descrição:
  Cobrir com testes todos os módulos: shared, auth, products, orders, payments.
  Testar casos de sucesso e casos de erro (fronteiras).
  Garantir que Singletons retornam a mesma instância.
  Runner HTML para execução no navegador.

Critérios de aceite:
  - [ ] Mínimo de 40 testes passando
  - [ ] Cobertura: AppConfig, EventBus, Formatters, Produto, ProductRepository,
        ProductService, ItemPedido, Pedido, OrderService, PaymentService,
        PaymentRepository, Usuario
  - [ ] Todos os testes de fronteira de desconto (R$50, R$100)
  - [ ] runner.html funcional no navegador

Labels: testing, quality, sprint-1, sprint-2
Responsável: @dev-qa
```

---

## Pull Requests

### PR #1 — feat: separação módulo de produtos e pedidos

```
Título: feat(arch): separação dos módulos products e orders

Descrição:
  Refatora o MVC para arquitetura modular, extraindo os domínios
  de produtos e pedidos em módulos independentes.

  Mudanças:
  - Produto movido para /modules/products/entities/
  - ProductRepository e ProductService criados
  - ItemPedido e Pedido movidos para /modules/orders/entities/
  - OrderRepository e OrderService criados (renomeados de Pedido*)
  - AppConfig, EventBus e Logger adicionados em /shared

  Padrões aplicados: Factory, Singleton, Repository, Observer

  Relacionado: MOD-01, MOD-02, MOD-03, MOD-06

  Como testar:
    Abrir index.html e verificar que o pedido funciona normalmente.
    Abrir tests/runner.html e verificar que todos os testes passam.

Reviewers: @tech-lead
Labels: architecture, feature
```

---

### PR #2 — feat: módulo de pagamentos, auth e middlewares

```
Título: feat(arch): módulos payments e auth + middlewares globais

Descrição:
  Adiciona os módulos de pagamentos e autenticação.
  Implementa o padrão Strategy para desconto em PaymentService.
  Adiciona AuthMiddleware e ErrorHandler como middlewares globais.
  Tela de login integrada à View.

  Mudanças:
  - /modules/payments/ completo com Strategy de desconto
  - /modules/auth/ completo com sessão fake
  - AuthMiddleware em /shared/middlewares/
  - ErrorHandler em /shared/middlewares/
  - PedidoView atualizada para login e log panel

  Padrões aplicados: Strategy, Middleware, Singleton

  Relacionado: MOD-04, MOD-05, MOD-07, MOD-08, MOD-09

  Breaking changes:
    View agora requer AuthController além de OrderController.
    Bootstrap atualizado no index.html.

Reviewers: @tech-lead, @dev-frontend
Labels: architecture, security, feature
```

---

## Resumo da Simulação

| Métrica                    | Valor                    |
|----------------------------|--------------------------|
| Total de issues abertas    | 5                        |
| Total de issues fechadas   | 5                        |
| Pull Requests mergeados    | 2                        |
| Sprints realizados         | 3                        |
| Total de pontos entregues  | 42                       |
| Cobertura de testes        | 45+ casos                |
| Módulos criados            | 4 (auth, orders, products, payments) |
| Arquivos shared            | 6 (config + utils + middlewares) |
