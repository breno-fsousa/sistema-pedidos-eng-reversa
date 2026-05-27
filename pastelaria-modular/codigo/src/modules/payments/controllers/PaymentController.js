/**
 * MODULE: payments
 * LAYER: controllers
 * FILE: PaymentController.js
 *
 * Responsabilidade: Coordenar o fluxo do módulo de pagamentos.
 * Reage ao evento PEDIDO_FINALIZADO emitido pelo módulo orders,
 * demonstrando comunicação entre módulos via EventBus (sem acoplamento direto).
 */
class PaymentController {
  constructor() {
    this._service    = new PaymentService();
    this._repository = new PaymentRepository();
    this._bus        = new EventBus();
    this._errorHandler = new ErrorHandler();

    // Ouve evento do módulo orders — comunicação desacoplada entre módulos
    this._bus.on(EVENTOS.PEDIDO_FINALIZADO, (dados) => {
      this._processarPagamentoPedido(dados.resumo);
    });

    Logger.info("PaymentController", "Controlador de pagamentos inicializado");
  }

  /**
   * Processa automaticamente o pagamento quando um pedido é finalizado.
   * @param {object} resumo
   */
  _processarPagamentoPedido(resumo) {
    try {
      const pagamento = this._service.processarPagamento({
        pedidoId: resumo.pedidoId || Formatters.gerarId(),
        valor:    resumo.totalFinal,
        metodo:   Pagamento.METODOS.DINHEIRO,
      });
      this._repository.salvarLocal(pagamento);
    } catch (e) {
      this._errorHandler.tratar(e, "PaymentController", ErrorHandler.TIPOS.NEGOCIO);
    }
  }
}
