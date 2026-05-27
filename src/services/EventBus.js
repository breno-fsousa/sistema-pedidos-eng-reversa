/**
 * SERVICE: EventBus  (Padrão Observer + Singleton)
 *
 * Responsabilidade: Canal de comunicação desacoplado entre camadas.
 * Permite que qualquer parte do sistema publique ou assine eventos
 * sem criar dependência direta entre os componentes.
 *
 * Singleton: garante que todos compartilhem o mesmo barramento de eventos.
 * Observer:  qualquer módulo pode se registrar como observador de um evento.
 *
 * Fluxo:
 *   Controller emite evento → EventBus notifica → View reage
 *
 * Sem o EventBus, a View precisaria ser conhecida diretamente pelo Controller,
 * criando acoplamento rígido entre as camadas.
 */
class EventBus {
  constructor() {
    // Singleton: se já existe instância, retorna ela
    if (EventBus._instancia) {
      return EventBus._instancia;
    }
    this._listeners = {};
    EventBus._instancia = this;
  }

  /**
   * Registra um callback para ser chamado quando o evento for emitido.
   * @param {string}   evento
   * @param {Function} callback
   */
  on(evento, callback) {
    if (typeof callback !== "function") {
      throw new Error(`EventBus.on: callback deve ser uma função (evento: "${evento}")`);
    }
    if (!this._listeners[evento]) {
      this._listeners[evento] = [];
    }
    this._listeners[evento].push(callback);
  }

  /**
   * Remove um callback registrado para um evento.
   * @param {string}   evento
   * @param {Function} callback
   */
  off(evento, callback) {
    if (!this._listeners[evento]) return;
    this._listeners[evento] = this._listeners[evento].filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Dispara todos os callbacks registrados para o evento, passando os dados.
   * @param {string} evento
   * @param {*}      dados
   */
  emit(evento, dados) {
    const callbacks = this._listeners[evento] || [];
    callbacks.forEach((cb) => cb(dados));
  }

  /**
   * Remove todos os listeners de um evento (útil em testes).
   * @param {string} evento
   */
  limpar(evento) {
    if (evento) {
      this._listeners[evento] = [];
    } else {
      this._listeners = {};
    }
  }
}

// Garante singleton mesmo sem módulos ES
EventBus._instancia = null;

/**
 * Constantes de eventos do sistema.
 * Evita strings "mágicas" espalhadas pelo código.
 */
const EVENTOS = Object.freeze({
  PEDIDO_ATUALIZADO: "pedido:atualizado",
  PEDIDO_FINALIZADO: "pedido:finalizado",
  PEDIDO_LIMPO:      "pedido:limpo",
  ERRO:              "sistema:erro",
  TOAST:             "sistema:toast",
});
