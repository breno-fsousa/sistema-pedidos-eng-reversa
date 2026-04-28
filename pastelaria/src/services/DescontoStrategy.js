class SemDescontoStrategy {
  calcular(total) {
    return 0;
  }
  descricao() {
    return "Sem desconto";
  }
}


class DescontoMedioStrategy {
  // Aplicado quando total > R$ 50
  calcular(total) {
    return total * 0.1;
  }
  descricao() {
    return "Desconto 10% (pedido acima de R$ 50)";
  }
}


class DescontoAltoStrategy {
  // Aplicado quando total > R$ 100
  calcular(total) {
    return total * 0.2;
  }
  descricao() {
    return "Desconto 20% (pedido acima de R$ 100)";
  }
}


/**
 * Seleciona automaticamente a estratégia correta com base no total.
 */
class DescontoStrategySelector {
  static selecionar(total) {
    if (total > 100) return new DescontoAltoStrategy();
    if (total > 50)  return new DescontoMedioStrategy();
    return new SemDescontoStrategy();
  }
}
