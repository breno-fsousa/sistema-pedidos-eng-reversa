# 🗺️ Diagrama de Módulos — Arquitetura Modular

## Parte 9 — Diagrama de Módulos e Dependências

```
╔══════════════════════════════════════════════════════════════════════╗
║                    ARQUITETURA MODULAR — PASTELARIA DO ZÉ            ║
╚══════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────┐
│                         VIEW (Camada de UI)                         │
│                          PedidoView.js                              │
│         Única camada que acessa o DOM. Recebe Controllers.          │
│         Reage passivamente via EventBus (Observer).                 │
└────────┬──────────┬────────────────────────────────────┬────────────┘
         │          │                                    │
         │ usa      │ usa                                │ ouve via EventBus
         ▼          ▼                                    ▼
┌──────────────┐ ┌──────────────┐              ┌──────────────────────┐
│    MODULE    │ │    MODULE    │              │       SHARED         │
│     auth     │ │    orders    │              │      EventBus        │
│ ──────────── │ │ ──────────── │              │      (Observer)      │
│AuthController││OrderController               └──────────────────────┘
│ AuthService  │ │OrderService  │                         ▲
│ AuthRepository││OrderRepository                         │ emite eventos
│ Usuario      │ │Pedido        │─────────────────────────┘
└──────────────┘ │ItemPedido    │
                 └──────┬───────┘
                        │ usa (comunicação entre módulos)
          ┌─────────────┴──────────────┐
          │                            │
          ▼                            ▼
┌──────────────────┐      ┌────────────────────┐
│     MODULE       │      │      MODULE        │
│    products      │      │     payments       │
│ ──────────────── │      │ ────────────────── │
│ ProductController│      │ PaymentController  │
│ ProductService   │      │ PaymentService     │
│ ProductRepository│      │ PaymentRepository  │
│ Produto          │      │ Pagamento          │
└──────────────────┘      │ (Strategy Pattern) │
                          └────────────────────┘

══════════════════════════════════════════════════════════════════════
                    SHARED — Recursos Transversais
══════════════════════════════════════════════════════════════════════

┌───────────────┐  ┌───────────────┐  ┌─────────────────────────────┐
│  AppConfig    │  │   EventBus    │  │         Middlewares         │
│  (Singleton)  │  │  (Singleton + │  │ ──────────────────────────  │
│               │  │   Observer)   │  │ AuthMiddleware  (auth fake) │
│ Centraliza    │  │               │  │ ErrorHandler   (erros glob.)│
│ configurações │  │ Canal de      │  └─────────────────────────────┘
│ do sistema    │  │ eventos entre │
└───────────────┘  │ módulos       │  ┌─────────────────────────────┐
                   └───────────────┘  │          Utils              │
┌───────────────┐                     │ ──────────────────────────  │
│    Logger     │                     │ Formatters  (funções puras) │
│  (Singleton)  │                     └─────────────────────────────┘
│               │
│ Log central   │
│ em memória    │
└───────────────┘

══════════════════════════════════════════════════════════════════════
                    DEPENDÊNCIAS ENTRE MÓDULOS
══════════════════════════════════════════════════════════════════════

  orders ──usa──► products     (OrderService usa ProductService)
  orders ──usa──► payments     (OrderService usa PaymentService.calcularDesconto)
  orders ──emite─► EventBus    (PEDIDO_FINALIZADO, PEDIDO_ATUALIZADO, PEDIDO_LIMPO)
  payments ──ouve─► EventBus   (PEDIDO_FINALIZADO → processa pagamento)
  auth ──emite──► EventBus     (USUARIO_LOGADO, USUARIO_DESLOGADO)
  todos ──usam──► shared       (AppConfig, Logger, Formatters, EventBus)

  ┌─────────┐     ┌──────────┐     ┌──────────┐
  │ orders  │────►│ products │     │   auth   │
  │         │     └──────────┘     └──────────┘
  │         │     ┌──────────┐          │
  │         │────►│ payments │          │
  └────┬────┘     └────┬─────┘          │
       │               │                │
       └───────┬───────┘                │
               ▼                        ▼
         ┌──────────┐            ┌──────────┐
         │ EventBus │◄───────────│  todos   │
         │ (shared) │            └──────────┘
         └──────────┘
```

---

## Fluxo Arquitetural Completo

```
══════════════════════════════════════════════════════════════════════
             FLUXO: Usuário adiciona um item ao pedido
══════════════════════════════════════════════════════════════════════

  [USUÁRIO clica "Adicionar"]
         │
         ▼
  ┌─────────────────────────────────────────────┐
  │  VIEW: PedidoView._onAdicionar()             │
  │  • Lê produtoId e quantidade do formulário   │
  │  • Delega ao OrderController                 │
  └──────────────────────┬──────────────────────┘
                         │ chama
                         ▼
  ┌─────────────────────────────────────────────┐
  │  CONTROLLER: OrderController.adicionar()     │
  │  • Chama OrderService.adicionarItem()        │
  │  • Em caso de erro → ErrorHandler.tratar()   │
  │  • Em caso de sucesso → _persistirENotificar │
  └──────────┬──────────────────────────────────┘
             │ aciona
             ▼
  ┌─────────────────────────────────────────────┐
  │  SERVICE: OrderService.adicionarItem()       │
  │  • Valida quantidade                         │
  │  • Chama ProductService.criarProduto()  ──►  MODULE: products
  │  • Cria ItemPedido(produto, qtd)             │
  │  • Chama Pedido.adicionarItem(item)          │
  └──────────┬──────────────────────────────────┘
             │ após sucesso
             ▼
  ┌─────────────────────────────────────────────┐
  │  REPOSITORY: OrderRepository.salvarLocal()   │
  │  • Persiste pedido atual no localStorage     │
  └──────────┬──────────────────────────────────┘
             │ notifica
             ▼
  ┌─────────────────────────────────────────────┐
  │  SHARED: EventBus.emit(PEDIDO_ATUALIZADO)    │
  │  • Publica evento com { itens, total }       │
  └──────────┬──────────────────────────────────┘
             │ Observer notifica
             ▼
  ┌─────────────────────────────────────────────┐
  │  VIEW: PedidoView._renderizarLista()         │
  │  • Atualiza lista de itens no DOM            │
  │  • Atualiza subtotal exibido                 │
  └─────────────────────────────────────────────┘
         │
         ▼
  [USUÁRIO vê o item adicionado na lista]


══════════════════════════════════════════════════════════════════════
             FLUXO: Usuário finaliza o pedido
══════════════════════════════════════════════════════════════════════

  [USUÁRIO clica "Finalizar Pedido"]
         │
         ▼
  PedidoView._onFinalizar()
         │
         ▼
  OrderController.finalizar(telCliente, telEstab)
         │
         ├──► OrderService.finalizar()
         │         ├──► calcularResumo()
         │         │         └──► PaymentService.calcularDesconto(subtotal)
         │         │                   └──► DescontoStrategySelector.selecionar()
         │         │                             └──► Strategy correta
         │         └──► Pedido.finalizar()  (muda status)
         │
         ├──► OrderRepository.salvarUltimoPedido(resumo)
         ├──► OrderRepository.salvarPedidoAPI(pedido)   (JSON Server)
         ├──► OrderRepository.limparLocal()
         │
         ├──► OrderService.gerarMensagemWhatsApp(resumo, telCliente)
         ├──► OrderService.gerarMensagemWhatsApp(resumo, telEstab)
         │
         ├──► EventBus.emit(PEDIDO_FINALIZADO, { resumo, urlCliente, urlEstab })
         │         │
         │         ├──► PedidoView._abrirModal()          (Observer)
         │         ├──► PedidoView._renderizarLista([], 0) (Observer)
         │         └──► PaymentController._processarPagamentoPedido()  (Observer)
         │                   └──► PaymentService.processarPagamento()
         │                             └──► EventBus.emit(PAGAMENTO_APROVADO)
         │
         └──► Cria novo Pedido + OrderService para próximo ciclo


══════════════════════════════════════════════════════════════════════
             FLUXO: Login de usuário (AuthMiddleware)
══════════════════════════════════════════════════════════════════════

  [USUÁRIO preenche login e senha]
         │
         ▼
  PedidoView._onLogin()
         │
         ▼
  AuthController.login(login, senha)
         │
         ▼
  AuthService.login(login, senha)
         ├──► Valida credenciais contra base fake
         ├──► Gera token fake
         ├──► AuthRepository.salvarSessao(token, usuario)
         └──► EventBus.emit(USUARIO_LOGADO, usuario)
                   │
                   └──► PedidoView._fecharLoginOverlay()  (Observer)
                   └──► PedidoView._atualizarInfoUsuario() (Observer)

  [USUÁRIO vê o sistema desbloqueado com seu nome no header]
```

---

## Diagrama de Classes por Módulo

```
MODULE: products
────────────────
  Produto
    - id: string
    - nome: string
    - preco: number
    - categoria: string
    - disponivel: boolean
    + getId(), getNome(), getPreco(), getCategoria()
    + CATALOGO: static object

  ProductRepository (Singleton)
    - _instancia: static
    + listarTodos(): Produto[]
    + buscarPorId(id): Produto
    + existe(id): boolean

  ProductService
    + criarProduto(id): Produto
    + listarProdutos(): Produto[]
    + listarPorCategoria(): object

MODULE: orders
────────────────
  ItemPedido
    - _produto: Produto
    - _quantidade: number
    + getProduto(), getQuantidade(), getSubtotal()

  Pedido
    - _id: string
    - _itens: ItemPedido[]
    - _status: string
    - STATUS: static { ABERTO, FINALIZADO, CANCELADO }
    + adicionarItem(), removerUltimoItem(), limpar()
    + getTotal(), getItens(), finalizar(), cancelar()

  OrderRepository (Singleton)
    + salvarPedidoLocal(pedido)
    + carregarPedidoLocal(): object
    + salvarUltimoPedido(resumo)
    + limparLocal()
    + salvarPedidoAPI(pedido): Promise
    + listarPedidosAPI(): Promise

  OrderService
    + adicionarItem(produtoId, qtd): ItemPedido
    + removerUltimoItem()
    + calcularResumo(): object
    + finalizar(): object
    + gerarMensagemWhatsApp(resumo, telefone): string

MODULE: payments
────────────────
  Pagamento
    - _id: string
    - _pedidoId: string
    - _valor: number
    - _metodo: string
    - _status: string
    - STATUS: static { PENDENTE, APROVADO, RECUSADO }
    + aprovar(), recusar()

  SemDescontoStrategy
  DescontoMedioStrategy(taxa)
  DescontoAltoStrategy(taxa)
    + calcular(total): number
    + descricao(): string
    + percentual(): number

  DescontoStrategySelector
    + selecionar(total): Strategy

  PaymentService
    + static calcularDesconto(total): object
    + processarPagamento({ pedidoId, valor, metodo }): Pagamento

MODULE: auth
────────────────
  Usuario
    - _id, _nome, _papel, _criadoEm
    - PAPEIS: static { ADMIN, ATENDENTE }
    + isAdmin(): boolean

  AuthRepository (Singleton)
    + salvarSessao(token, usuario)
    + carregarUsuario(): Usuario
    + temSessaoAtiva(): boolean
    + limparSessao()

  AuthService
    + login(login, senha): { ok, usuario, erro }
    + logout()
    + getUsuarioAtual(): Usuario
    + estaLogado(): boolean

SHARED
────────────────
  AppConfig (Singleton)
    + get(chave): *
    + getAll(): object

  EventBus (Singleton)
    + on(evento, callback)
    + off(evento, callback)
    + emit(evento, dados)

  Logger (Singleton)
    + static info(modulo, msg, dados)
    + static warn(modulo, msg, dados)
    + static error(modulo, msg, dados)
    + static getHistorico(): object[]

  Formatters
    + moeda(valor): string
    + dataHora(iso): string
    + gerarId(): string
    + truncar(texto, limite): string

  AuthMiddleware
    + login(usuario, senha): object
    + logout()
    + proteger(acao, papelExigido): boolean
    + estaLogado(): boolean

  ErrorHandler (Singleton)
    + tratar(erro, modulo, tipo)
    + executar(fn, modulo, tipo): Promise
    + TIPOS: static { VALIDACAO, NEGOCIO, REDE, AUTH, SISTEMA }
```
