/**
 * SHARED / UTILS: Logger  (Padrão Singleton)
 *
 * Responsabilidade: Centralizar todos os logs do sistema em um único ponto.
 * Evita console.log espalhados pelo código e permite:
 *   - Filtrar por nível (info, warn, error)
 *   - Persistir logs em memória (histórico consultável)
 *   - Emitir eventos de log para a UI (desafio extra — Parte 10)
 *   - Substituir por um serviço real de log sem alterar os módulos
 *
 * Padrão Singleton: garante um único histórico de logs na aplicação.
 */
class Logger {
  constructor() {
    if (Logger._instancia) {
      return Logger._instancia;
    }
    this._historico = [];   // log em memória
    this._maxHistorico = 200;
    Logger._instancia = this;
  }

  // ---- API estática (atalhos convenientes) ----

  static info(modulo, mensagem, dados) {
    Logger._get()._registrar("INFO", modulo, mensagem, dados);
  }

  static warn(modulo, mensagem, dados) {
    Logger._get()._registrar("WARN", modulo, mensagem, dados);
  }

  static error(modulo, mensagem, dados) {
    Logger._get()._registrar("ERROR", modulo, mensagem, dados);
  }

  static getHistorico() {
    return [...Logger._get()._historico];
  }

  static limpar() {
    Logger._get()._historico = [];
  }

  // ---- Internos ----

  _registrar(nivel, modulo, mensagem, dados) {
    const entrada = {
      nivel,
      modulo,
      mensagem,
      dados: dados ?? null,
      timestamp: new Date().toISOString(),
    };

    // Mantém histórico limitado
    this._historico.push(entrada);
    if (this._historico.length > this._maxHistorico) {
      this._historico.shift();
    }

    // Saída no console com formatação consistente
    const prefixo = `[${nivel}] [${modulo}]`;
    if (nivel === "ERROR") {
      console.error(prefixo, mensagem, dados ?? "");
    } else if (nivel === "WARN") {
      console.warn(prefixo, mensagem, dados ?? "");
    } else {
      console.log(prefixo, mensagem, dados ?? "");
    }

    // Emite evento de log (se EventBus já estiver disponível)
    try {
      const bus = new EventBus();
      bus.emit(EVENTOS.LOG, entrada);
    } catch (_) {
      // EventBus pode não estar disponível ainda na inicialização
    }
  }

  static _get() {
    if (!Logger._instancia) new Logger();
    return Logger._instancia;
  }
}

Logger._instancia = null;
