# 🧩 Modularização — Organização por Domínio

## Parte 3 — Organização dos Módulos

A arquitetura modular organiza o código por **domínio de negócio**, não por tipo
de camada. Cada módulo é uma unidade autônoma com tudo que precisa para funcionar.

---

### Estrutura completa

```
/src
  /modules
    /auth
      /entities       → Usuario.js
      /repositories   → AuthRepository.js
      /services       → AuthService.js
      /controllers    → AuthController.js

    /orders
      /entities       → ItemPedido.js, Pedido.js
      /repositories   → OrderRepository.js
      /services       → OrderService.js
      /controllers    → OrderController.js

    /products
      /entities       → Produto.js
      /repositories   → ProductRepository.js
      /services       → ProductService.js
      /controllers    → ProductController.js

    /payments
      /entities       → Pagamento.js
      /repositories   → PaymentRepository.js
      /services       → PaymentService.js (inclui Strategy de desconto)
      /controllers    → PaymentController.js

  /shared
    /config           → AppConfig.js  (Singleton)
    /utils            → EventBus.js, Logger.js, Formatters.js
    /middlewares      → AuthMiddleware.js, ErrorHandler.js

  /views              → PedidoView.js, style.css
```

---

### Módulo: auth

**Responsabilidade:** Autenticação e gerenciamento de sessão do usuário.

| Arquivo              | Papel                                                       |
|----------------------|-------------------------------------------------------------|
| `Usuario.js`         | Entidade com id, nome, papel (admin/atendente)              |
| `AuthRepository.js`  | Persiste/recupera sessão no `sessionStorage`               |
| `AuthService.js`     | Valida credenciais, gera token fake, controla logout        |
| `AuthController.js`  | Expõe login/logout/getUsuario para a View                   |

**Regras de negócio próprias:**
- Credenciais válidas: `admin/1234` e `atendente/1234`
- Hierarquia de papéis: `admin` > `atendente`
- Sessão persiste durante a aba (sessionStorage)

---

### Módulo: orders

**Responsabilidade:** Ciclo de vida completo de um pedido de mesa.

| Arquivo              | Papel                                                       |
|----------------------|-------------------------------------------------------------|
| `ItemPedido.js`      | Entidade que une Produto + quantidade, calcula subtotal     |
| `Pedido.js`          | Entidade agregadora com status (aberto/finalizado/cancelado)|
| `OrderRepository.js` | localStorage + JSON Server para pedidos                     |
| `OrderService.js`    | Adicionar/remover itens, calcular resumo, finalizar, WhatsApp|
| `OrderController.js` | Orquestra fluxo, persiste, emite eventos, restaura sessão  |

**Comunicação com outros módulos:**
- Usa `ProductService` para criar produtos (módulo products)
- Usa `PaymentService.calcularDesconto()` (módulo payments)
- Emite `PEDIDO_FINALIZADO` via EventBus → PaymentController reage

---

### Módulo: products

**Responsabilidade:** Catálogo e dados de produtos do cardápio.

| Arquivo                 | Papel                                                    |
|-------------------------|----------------------------------------------------------|
| `Produto.js`            | Entidade com id, nome, preço, categoria, disponibilidade |
| `ProductRepository.js`  | Acessa catálogo estático (futuro: API de produtos)       |
| `ProductService.js`     | Lista produtos, cria por ID (Factory embutido), agrupa   |
| `ProductController.js`  | Expõe listagem e agrupamento para a View                 |

**Catálogo atual:**
| ID            | Nome        | Preço | Categoria |
|---------------|-------------|-------|-----------|
| pastel        | Pastel      | R$5   | salgado   |
| caldo         | Caldo       | R$7   | salgado   |
| refrigerante  | Refrigerante| R$4   | bebida    |
| suco          | Suco        | R$6   | bebida    |

---

### Módulo: payments

**Responsabilidade:** Regras financeiras, cálculo de desconto e processamento de pagamentos.

| Arquivo                  | Papel                                                    |
|--------------------------|----------------------------------------------------------|
| `Pagamento.js`           | Entidade com pedidoId, valor, método, status             |
| `PaymentRepository.js`   | Persiste pagamentos localmente                           |
| `PaymentService.js`      | Strategy de desconto + processamento de pagamento fake   |
| `PaymentController.js`   | Reage a `PEDIDO_FINALIZADO` e processa pagamento         |

**Regras de desconto (Strategy):**
| Total do pedido | Desconto aplicado |
|-----------------|-------------------|
| Até R$ 50,00    | 0%                |
| R$ 50,01–100,00 | 10%               |
| Acima de R$100  | 20%               |

**Taxa de serviço:** 5% sempre (configurado em `AppConfig`)

---

### Shared — Recursos transversais

Recursos que não pertencem a nenhum módulo específico mas são usados por todos.

| Arquivo             | Padrão     | Papel                                                      |
|---------------------|------------|------------------------------------------------------------|
| `AppConfig.js`      | Singleton  | Configuração global centralizada (URLs, taxas, limites)    |
| `EventBus.js`       | Singleton + Observer | Canal de comunicação desacoplado entre módulos   |
| `Logger.js`         | Singleton  | Log centralizado com histórico e emissão de eventos        |
| `Formatters.js`     | Utilitário | Funções puras de formatação (moeda, data, ID, texto)       |
| `AuthMiddleware.js` | Middleware | Intercepta ações e verifica autenticação antes de executar |
| `ErrorHandler.js`   | Middleware + Singleton | Trata erros de todos os módulos de forma unificada |

---

## Parte 6 — Reorganização das Classes (MVC → Modular)

### Tabela de migração

| Classe/Arquivo (MVC)         | Novo local (Modular)                                          | Motivo da mudança                              |
|------------------------------|---------------------------------------------------------------|------------------------------------------------|
| `src/models/Produto.js`      | `modules/products/entities/Produto.js`                        | Pertence ao domínio de produtos                |
| `src/models/ItemPedido.js`   | `modules/orders/entities/ItemPedido.js`                       | Pertence ao domínio de pedidos                 |
| `src/models/Pedido.js`       | `modules/orders/entities/Pedido.js`                           | Pertence ao domínio de pedidos                 |
| `src/models/Factories.js`    | Distribuído: `ProductService`, `OrderService`                 | Factory embutida no Service do módulo dono     |
| `src/services/PedidoService` | `modules/orders/services/OrderService.js`                     | Renomeado para seguir convenção do domínio     |
| `src/services/DescontoService`| `modules/payments/services/PaymentService.js`                | Desconto é regra financeira, pertence a payments|
| `src/services/EventBus.js`   | `shared/utils/EventBus.js`                                    | Recurso transversal sem dono de domínio        |
| `src/repositories/PedidoRepository`| `modules/orders/repositories/OrderRepository.js`       | Pertence ao domínio de pedidos                 |
| `src/controllers/PedidoController`| `modules/orders/controllers/OrderController.js`         | Responsabilidade única: orquestrar pedidos     |
| `src/views/PedidoView.js`    | `src/views/PedidoView.js`                                     | View permanece transversal (camada de UI)      |
| *(não existia)*              | `modules/auth/` completo                                      | Novo módulo: autenticação                      |
| *(não existia)*              | `modules/payments/entities/Pagamento.js`                      | Entidade de pagamento isolada                  |
| *(não existia)*              | `shared/config/AppConfig.js`                                  | Configuração centralizada (Singleton)          |
| *(não existia)*              | `shared/utils/Logger.js`                                      | Log centralizado (desafio extra)               |
| *(não existia)*              | `shared/utils/Formatters.js`                                  | Utilitários de formatação isolados             |
| *(não existia)*              | `shared/middlewares/ErrorHandler.js`                          | Tratamento global de erros (desafio extra)     |
| *(não existia)*              | `shared/middlewares/AuthMiddleware.js`                        | Middleware de autenticação (desafio extra)      |

### Critérios usados para a reorganização

1. **Dono do domínio:** A entidade vai para o módulo que é responsável pelo seu ciclo de vida completo.
2. **Regra de negócio:** O Service fica no módulo cujo domínio é dono da regra (desconto é financeiro → `payments`).
3. **Recurso transversal:** Vai para `shared` quando múltiplos módulos precisam dele sem que nenhum seja seu dono natural.
4. **Sem duplicação:** Nenhuma classe foi copiada — foi movida e/ou renomeada para refletir o domínio.
5. **Convenção de nomes:** Classes renomeadas para refletir o módulo (`PedidoService` → `OrderService`, `PedidoRepository` → `OrderRepository`).
