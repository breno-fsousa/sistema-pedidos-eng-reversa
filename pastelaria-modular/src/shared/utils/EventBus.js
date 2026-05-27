/**
 * SHARED / UTILS: EventBus  (Padrão Observer + Singleton)
 *
 * Responsabilidade: Barramento de eventos compartilhado entre TODOS os módulos.
 * É o canal de comunicação desacoplado da arquitetura modular.
 *
 * Na arquitetura modular, o EventBus vive em /shared porque é um recurso
 * transversal — qualquer módulo pode publicar ou assinar eventos sem
 * criar dependência direta entre si.
 *
 * Exemplo de comunicação entre módulos sem acoplamento:
 *   [orders] emite  → "order:finalizado"
 *   [payments] ouve → "order:finalizado" e inicia pagamento
 *   [auth]    ouve  → "order:finalizado" e registra log de sessão
 *
 * Nenhum módulo conhece o outro diretamente.
 */
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
   * @param {string}   evento
   * @param {Function} callback
   */
  on(evento, callback) {
    if (typeof callback !== "function") {
      throw new Error(`EventBus.on: callback deve ser função (evento: "${evento}")`);
    }
    if (!this._listeners[evento]) {
      this._listeners[evento] = [];
    }
    this._listeners[evento].push(callback);
  }

  /**
   * Remove um listener de um evento.
   * @param {string}   evento
   * @param {Function} callback
   */
  off(evento, callback) {
    if (!this._listeners[evento]) return;
    this._listeners[evento] = this._listeners[evento].filter((cb) => cb !== callback);
  }

  /**
   * Dispara todos os listeners registrados para o evento.
   * @param {string} evento
   * @param {*}      dados
   */
  emit(evento, dados) {
    const callbacks = this._listeners[evento] || [];
    callbacks.forEach((cb) => {
      try {
        cb(dados);
      } catch (e) {
        // Um listener com erro não deve quebrar os demais
        Logger.error(`EventBus: erro no listener de "${evento}"`, e.message);
      }
    });
  }

  /** Remove todos os listeners (útil em testes). */
  limparTudo() {
    this._listeners = {};
  }
}

EventBus._instancia = null;

/**
 * Catálogo global de eventos do sistema.
 * Evita strings "mágicas" espalhadas pelos módulos.
 * Cada módulo adiciona seus próprios eventos neste objeto.
 */
const EVENTOS = Object.freeze({
  // Módulo: orders
  PEDIDO_ATUALIZADO:  "order:atualizado",
  PEDIDO_FINALIZADO:  "order:finalizado",
  PEDIDO_LIMPO:       "order:limpo",

  // Módulo: payments
  PAGAMENTO_APROVADO:  "payment:aprovado",
  PAGAMENTO_REJEITADO: "payment:rejeitado",

  // Módulo: auth
  USUARIO_LOGADO:    "auth:logado",
  USUARIO_DESLOGADO: "auth:deslogado",

  // Shared
  ERRO:  "system:erro",
  TOAST: "system:toast",
  LOG:   "system:log",
});
