/**
 * MODULE: orders
 * LAYER: controllers
 * FILE: OrderController.js
 *
 * Responsabilidade: Coordenar o fluxo do módulo de pedidos.
 * Recebe ações da View, aciona OrderService e OrderRepository,
 * e notifica a UI via EventBus (Observer).
 *
 * Na arquitetura modular, o controller é MENOR que no MVC tradicional
 * porque as responsabilidades estão melhor distribuídas:
 *   - Regras de negócio → OrderService
 *   - Persistência      → OrderRepository
 *   - Erros             → ErrorHandler (shared)
 *   - Autenticação      → AuthMiddleware (shared)
 *   - Notificações      → EventBus (shared)
 *
 * O controller apenas ORQUESTRA — não decide nem calcula.
 *
 * Fluxo completo:
 *   View → OrderController → OrderService → (ProductService, PaymentService)
 *                         → OrderRepository → localStorage / JSON Server
 *                         → EventBus → View reage
 */
class OrderController {
  constructor() {
    this._pedido       = new Pedido();
    this._service      = new OrderService(this._pedido);
    this._repository   = new OrderRepository();
    this._bus          = new EventBus();
    this._errorHandler = new ErrorHandler();
    this._auth         = new AuthMiddleware();

    this._restaurarSessao();
    Logger.info("OrderController", "Controlador de pedidos inicializado");
  }

  // ================================================================
  // Ações expostas à View
  // ================================================================

  /**
   * Adiciona um item ao pedido atual.
   * @param {string}        produtoId
   * @param {number|string} quantidade
   */
  adicionar(produtoId, quantidade) {
    try {
      this._service.adicionarItem(produtoId, quantidade);
      this._persistirENotificar();
    } catch (e) {
      this._errorHandler.tratar(e, "OrderController", ErrorHandler.TIPOS.VALIDACAO);
    }
  }

  /**
   * Remove o último item adicionado.
   */
  removerUltimo() {
    try {
      this._service.removerUltimoItem();
      this._persistirENotificar();
    } catch (e) {
      this._errorHandler.tratar(e, "OrderController", ErrorHandler.TIPOS.NEGOCIO);
    }
  }

  /**
   * Finaliza o pedido:
   *  1. Valida (via Service)
   *  2. Persiste localmente e na API (via Repository)
   *  3. Notifica a View com resumo e links WhatsApp
   *  4. Reinicia o ciclo com pedido limpo
   *
   * @param {string} telefoneCliente
   * @param {string} telefoneEstabelecimento
   */
  async finalizar(telefoneCliente, telefoneEstabelecimento) {
    try {
      const config      = new AppConfig();
      const telCliente  = telefoneCliente  || config.get("TELEFONE_CLIENTE_PADRAO");
      const telEstab    = telefoneEstabelecimento || config.get("TELEFONE_ESTABELECIMENTO_PADRAO");

      const resumo = this._service.finalizar();

      // Persistência (Repository)
      this._repository.salvarUltimoPedido(resumo);
      await this._repository.salvarPedidoAPI(this._pedido);
      this._repository.limparLocal();

      // Links WhatsApp
      const urlCliente = this._service.gerarMensagemWhatsApp(resumo, telCliente);
      const urlEstab   = this._service.gerarMensagemWhatsApp(resumo, telEstab);

      // Notifica View (Observer)
      this._bus.emit(EVENTOS.PEDIDO_FINALIZADO, {
        resumo,
        urlClienteWhatsApp:         urlCliente,
        urlEstabelecimentoWhatsApp: urlEstab,
      });

      // Notifica módulo de pagamentos (comunicação entre módulos via EventBus)
      this._bus.emit(EVENTOS.PAGAMENTO_APROVADO, { resumo });

      // Reinicia pedido para próximo ciclo
      this._pedido  = new Pedido();
      this._service = new OrderService(this._pedido);

    } catch (e) {
      this._errorHandler.tratar(e, "OrderController", ErrorHandler.TIPOS.NEGOCIO);
    }
  }

  /**
   * Limpa todos os itens e reinicia o pedido.
   */
  limpar() {
    try {
      this._service.limpar();
      this._repository.limparLocal();
      this._bus.emit(EVENTOS.PEDIDO_LIMPO, null);
    } catch (e) {
      this._errorHandler.tratar(e, "OrderController", ErrorHandler.TIPOS.SISTEMA);
    }
  }

  // ================================================================
  // Leitura de estado (sem efeito colateral)
  // ================================================================

  getItens()  { return this._service.getItens();  }
  getTotal()  { return this._service.getTotal();  }
  getResumo() { return this._service.calcularResumo(); }

  // ================================================================
  // Métodos privados
  // ================================================================

  /**
   * Persiste o estado atual e notifica a View via EventBus.
   */
  _persistirENotificar() {
    this._repository.salvarPedidoLocal(this._pedido);
    this._bus.emit(EVENTOS.PEDIDO_ATUALIZADO, {
      itens: this._pedido.getItens(),
      total: this._pedido.getTotal(),
    });
  }

  /**
   * Restaura o pedido salvo da sessão anterior (recuperação de crash).
   */
  _restaurarSessao() {
    const salvo = this._repository.carregarPedidoLocal();
    if (!salvo || !Array.isArray(salvo.itens) || salvo.itens.length === 0) return;

    try {
      salvo.itens.forEach(({ produtoId, quantidade }) => {
        this._service.adicionarItem(produtoId, quantidade);
      });

      this._bus.emit(EVENTOS.PEDIDO_ATUALIZADO, {
        itens: this._pedido.getItens(),
        total: this._pedido.getTotal(),
      });

      Logger.info("OrderController", "Sessão restaurada", {
        itens: salvo.itens.length,
      });
    } catch (e) {
      Logger.warn("OrderController", "Não foi possível restaurar sessão", e.message);
      this._repository.limparLocal();
    }
  }
}
