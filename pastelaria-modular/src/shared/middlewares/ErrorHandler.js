/**
 * SHARED / MIDDLEWARES: ErrorHandler  (Padrão Middleware + Singleton)
 *
 * Responsabilidade: Centralizar o tratamento de erros de todos os módulos.
 * Intercepta erros antes que cheguem à UI de forma descoordenada.
 *
 * Em sistemas modulares, cada módulo pode gerar erros de tipos diferentes.
 * Sem um ErrorHandler global, cada Controller trataria erros do seu jeito,
 * gerando inconsistência na experiência do usuário.
 *
 * Com ErrorHandler:
 *   - Todos os erros passam pelo mesmo ponto
 *   - A UI recebe mensagens padronizadas
 *   - Os logs são registrados de forma consistente
 *   - É possível classificar erros (validação, rede, auth, negócio)
 */
class ErrorHandler {
  constructor() {
    if (ErrorHandler._instancia) {
      return ErrorHandler._instancia;
    }
    this._bus = new EventBus();
    ErrorHandler._instancia = this;
  }

  // ================================================================
  // Tipos de erro reconhecidos
  // ================================================================

  static TIPOS = Object.freeze({
    VALIDACAO: "VALIDACAO",   // dados inválidos do usuário
    NEGOCIO:   "NEGOCIO",     // regra de negócio violada
    REDE:      "REDE",        // falha de comunicação com API
    AUTH:      "AUTH",        // autenticação/autorização
    SISTEMA:   "SISTEMA",     // erro inesperado
  });

  // ================================================================
  // API pública
  // ================================================================

  /**
   * Trata um erro, classifica-o, loga e notifica a UI.
   * @param {Error|string} erro
   * @param {string}       modulo  - nome do módulo que originou o erro
   * @param {string}       tipo    - um de ErrorHandler.TIPOS
   */
  tratar(erro, modulo = "Sistema", tipo = ErrorHandler.TIPOS.SISTEMA) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);

    Logger.error(modulo, `[${tipo}] ${mensagem}`);

    // Mapeia tipo para mensagem amigável ao usuário
    const mensagemUI = this._mensagemAmigavel(mensagem, tipo);

    this._bus.emit(EVENTOS.ERRO, mensagemUI);
  }

  /**
   * Envolve uma função assíncrona com tratamento automático de erros.
   * Uso: await errorHandler.executar(() => service.finalizar(), "orders")
   *
   * @param {Function} fn     - função (sync ou async) a executar
   * @param {string}   modulo - nome do módulo para o log
   * @param {string}   tipo   - tipo do erro esperado
   * @returns {Promise<*>} resultado da função ou undefined em caso de erro
   */
  async executar(fn, modulo = "Sistema", tipo = ErrorHandler.TIPOS.NEGOCIO) {
    try {
      return await fn();
    } catch (e) {
      this.tratar(e, modulo, tipo);
      return undefined;
    }
  }

  // ================================================================
  // Interno
  // ================================================================

  _mensagemAmigavel(mensagem, tipo) {
    // Para erros de validação e negócio, a mensagem original já é clara
    if (tipo === ErrorHandler.TIPOS.VALIDACAO || tipo === ErrorHandler.TIPOS.NEGOCIO) {
      return mensagem;
    }
    if (tipo === ErrorHandler.TIPOS.REDE) {
      return "Serviço temporariamente indisponível. Tente novamente.";
    }
    if (tipo === ErrorHandler.TIPOS.AUTH) {
      return "Sessão expirada. Faça login novamente.";
    }
    return "Ocorreu um erro inesperado. Tente novamente.";
  }
}

ErrorHandler._instancia = null;
