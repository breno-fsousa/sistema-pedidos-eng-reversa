/**
 * SERVICE: DescontoService  (Padrão Strategy)
 *
 * Responsabilidade: Encapsular as diferentes estratégias de cálculo de desconto.
 * Cada estratégia implementa a mesma interface (calcular / descricao),
 * permitindo que o seletor escolha dinamicamente a estratégia correta
 * sem if/else espalhados pelo sistema.
 *
 * Separado do PedidoService para respeitar o Princípio da Responsabilidade Única:
 *   - DescontoService → sabe COMO calcular desconto
 *   - PedidoService   → sabe QUANDO e por que aplicar
 *
 * Regras de negócio:
 *   total <= R$ 50   → sem desconto
 *   total > R$ 50    → 10% de desconto
 *   total > R$ 100   → 20% de desconto
 *   taxa de serviço  →  5% sempre
 */

// ---- Estratégias individuais ----

class SemDescontoStrategy {
  calcular(_total) { return 0; }
  descricao()      { return "Sem desconto"; }
  percentual()     { return 0; }
}

class DescontoMedioStrategy {
  calcular(total) { return total * 0.10; }
  descricao()     { return "Desconto 10% (pedido acima de R$ 50,00)"; }
  percentual()    { return 10; }
}

class DescontoAltoStrategy {
  calcular(total) { return total * 0.20; }
  descricao()     { return "Desconto 20% (pedido acima de R$ 100,00)"; }
  percentual()    { return 20; }
}

// ---- Seletor de estratégia ----

/**
 * DescontoStrategySelector
 *
 * Centraliza a lógica de seleção da estratégia correta.
 * Ao adicionar uma nova faixa de desconto, basta alterar aqui,
 * sem tocar no restante do sistema.
 */
class DescontoStrategySelector {
  /**
   * Retorna a estratégia de desconto adequada ao total informado.
   * @param {number} total
   * @returns {SemDescontoStrategy|DescontoMedioStrategy|DescontoAltoStrategy}
   */
  static selecionar(total) {
    if (total > 100) return new DescontoAltoStrategy();
    if (total > 50)  return new DescontoMedioStrategy();
    return new SemDescontoStrategy();
  }
}

/**
 * DescontoService
 *
 * Fachada que expõe o uso das estratégias de forma simples ao PedidoService.
 * Isolado aqui para facilitar testes unitários das regras de desconto.
 */
class DescontoService {
  /**
   * Calcula o desconto aplicável a um total, retornando todos os detalhes.
   * @param {number} total
   * @returns {{ valor: number, descricao: string, percentual: number }}
   */
  static calcular(total) {
    const strategy = DescontoStrategySelector.selecionar(total);
    return {
      valor:      strategy.calcular(total),
      descricao:  strategy.descricao(),
      percentual: strategy.percentual(),
    };
  }
}
