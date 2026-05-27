/**
 * MODULE: payments
 * LAYER: repositories
 * FILE: PaymentRepository.js  (Padrão Repository + Singleton)
 *
 * Responsabilidade: Abstrair o acesso e persistência de pagamentos.
 */
class PaymentRepository {
  constructor() {
    if (PaymentRepository._instancia) {
      return PaymentRepository._instancia;
    }
    const config = new AppConfig();
    this._apiUrl = `${config.get("API_URL")}/pagamentos`;
    this._chave  = "pastelaria_pagamentos";
    PaymentRepository._instancia = this;
  }

  /**
   * Salva um pagamento localmente.
   * @param {Pagamento} pagamento
   */
  salvarLocal(pagamento) {
    try {
      const existentes = this._carregarTodos();
      existentes.push(pagamento.toJSON());
      localStorage.setItem(this._chave, JSON.stringify(existentes));
    } catch (e) {
      Logger.warn("PaymentRepository", "Falha ao salvar pagamento", e.message);
    }
  }

  /**
   * Carrega todos os pagamentos salvos localmente.
   * @returns {object[]}
   */
  _carregarTodos() {
    try {
      const raw = localStorage.getItem(this._chave);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  listarTodos() {
    return this._carregarTodos();
  }
}

PaymentRepository._instancia = null;
