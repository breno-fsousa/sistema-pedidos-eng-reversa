/**
 * MODULE: payments
 * LAYER: services
 * FILE: PaymentService.js  (Padrão Service + Strategy)
 *
 * Responsabilidade: Centralizar todas as regras financeiras do sistema.
 * Encapsula o cálculo de desconto usando o padrão Strategy,
 * tornando o módulo de pagamentos a autoridade sobre precificação.
 *
 * Por que payments é dono do desconto e não orders?
 *   Desconto é uma regra financeira, não uma regra de pedido.
 *   Se amanhã o desconto depender do histórico de pagamentos do cliente,
 *   a mudança fica contida aqui — sem tocar o módulo orders.
 *
 * Padrão Strategy:
 *   Cada faixa de desconto é uma estratégia independente.
 *   O seletor escolhe dinamicamente a estratégia correta.
 *   Para adicionar uma nova faixa, basta criar uma nova classe e
 *   registrá-la no seletor — sem alterar código existente (Open/Closed).
 */

// ---- Estratégias de desconto ----

class SemDescontoStrategy {
  calcular(_total) { return 0;  }
  descricao()      { return "Sem desconto"; }
  percentual()     { return 0;  }
}

class DescontoMedioStrategy {
  constructor(taxa) { this._taxa = taxa; }
  calcular(total)  { return total * this._taxa; }
  descricao()      { return `Desconto ${this._taxa * 100}% (pedido acima de R$ 50,00)`; }
  percentual()     { return this._taxa * 100; }
}

class DescontoAltoStrategy {
  constructor(taxa) { this._taxa = taxa; }
  calcular(total)  { return total * this._taxa; }
  descricao()      { return `Desconto ${this._taxa * 100}% (pedido acima de R$ 100,00)`; }
  percentual()     { return this._taxa * 100; }
}

// ---- Seletor de estratégia ----

class DescontoStrategySelector {
  constructor(config) {
    this._config = config;
  }

  /**
   * Seleciona a estratégia correta com base no total do pedido.
   * @param {number} total
   * @returns {SemDescontoStrategy|DescontoMedioStrategy|DescontoAltoStrategy}
   */
  selecionar(total) {
    const limiteAlto  = this._config.get("LIMITE_DESCONTO_ALTO");   // 100
    const limiteMedio = this._config.get("LIMITE_DESCONTO_MEDIO");  // 50
    const taxaAlto    = this._config.get("DESCONTO_ALTO");          // 0.20
    const taxaMedio   = this._config.get("DESCONTO_MEDIO");         // 0.10

    if (total > limiteAlto)  return new DescontoAltoStrategy(taxaAlto);
    if (total > limiteMedio) return new DescontoMedioStrategy(taxaMedio);
    return new SemDescontoStrategy();
  }
}

// ---- PaymentService ----

class PaymentService {
  constructor() {
    this._config   = new AppConfig();
    this._seletor  = new DescontoStrategySelector(this._config);
    this._historico = []; // pagamentos processados nesta sessão
    Logger.info("PaymentService", "Módulo de pagamentos inicializado");
  }

  /**
   * API estática — permite uso sem instanciar (chamado pelo OrderService).
   * Calcula desconto para um determinado total.
   * @param {number} total
   * @returns {{ valor: number, descricao: string, percentual: number }}
   */
  static calcularDesconto(total) {
    const config   = new AppConfig();
    const seletor  = new DescontoStrategySelector(config);
    const strategy = seletor.selecionar(total);
    return {
      valor:      strategy.calcular(total),
      descricao:  strategy.descricao(),
      percentual: strategy.percentual(),
    };
  }

  /**
   * Processa um pagamento (fake) para um pedido finalizado.
   * @param {{ pedidoId: string, valor: number, metodo: string }} dados
   * @returns {Pagamento}
   */
  processarPagamento({ pedidoId, valor, metodo = Pagamento.METODOS.DINHEIRO }) {
    const pagamento = new Pagamento({ pedidoId, valor, metodo });

    // Simulação: todos os pagamentos são aprovados (fake)
    pagamento.aprovar();

    this._historico.push(pagamento);

    Logger.info("PaymentService", "Pagamento processado", {
      id:     pagamento.getId(),
      valor:  Formatters.moeda(valor),
      metodo,
      status: pagamento.getStatus(),
    });

    const bus = new EventBus();
    bus.emit(EVENTOS.PAGAMENTO_APROVADO, { pagamento: pagamento.toJSON() });

    return pagamento;
  }

  /**
   * Retorna o histórico de pagamentos desta sessão.
   * @returns {Pagamento[]}
   */
  getHistorico() {
    return [...this._historico];
  }
}
