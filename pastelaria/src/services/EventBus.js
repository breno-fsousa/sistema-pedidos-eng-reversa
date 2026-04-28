class EventBus {
  constructor() {
    if (EventBus._instancia) {
      return EventBus._instancia;
    }
    this._listeners = {};
    EventBus._instancia = this;
  }

  /**
   * Registra um listener para um evento.
   * @param {string} evento
   * @param {Function} callback
   */
  on(evento, callback) {
    if (!this._listeners[evento]) {
      this._listeners[evento] = [];
    }
    this._listeners[evento].push(callback);
  }

  /**
   * Remove um listener de um evento.
   */
  off(evento, callback) {
    if (!this._listeners[evento]) return;
    this._listeners[evento] = this._listeners[evento].filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Dispara todos os listeners de um evento com os dados fornecidos.
   * @param {string} evento
   * @param {*} dados
   */
  emit(evento, dados) {
    const cbs = this._listeners[evento] || [];
    cbs.forEach((cb) => cb(dados));
  }
}

EventBus._instancia = null;

// Eventos utilizados no sistema
const EVENTOS = {
  PEDIDO_ATUALIZADO: "pedido:atualizado",
  PEDIDO_FINALIZADO: "pedido:finalizado",
  PEDIDO_LIMPO:      "pedido:limpo",
  ERRO:              "sistema:erro",
};
