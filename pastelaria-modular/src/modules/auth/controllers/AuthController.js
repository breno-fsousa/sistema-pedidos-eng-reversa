/**
 * MODULE: auth
 * LAYER: controllers
 * FILE: AuthController.js
 *
 * Responsabilidade: Coordenar o fluxo de autenticação.
 * Recebe ações de login/logout da View e aciona AuthService.
 */
class AuthController {
  constructor() {
    this._service      = new AuthService();
    this._bus          = new EventBus();
    this._errorHandler = new ErrorHandler();
    Logger.info("AuthController", "Controlador de autenticação inicializado");
  }

  /**
   * Realiza login e notifica a View via EventBus.
   * @param {string} login
   * @param {string} senha
   * @returns {boolean}
   */
  login(login, senha) {
    const resultado = this._service.login(login, senha);
    if (!resultado.ok) {
      this._bus.emit(EVENTOS.ERRO, resultado.erro);
      return false;
    }
    return true;
  }

  logout() {
    this._service.logout();
  }

  getUsuarioAtual() {
    return this._service.getUsuarioAtual();
  }

  estaLogado() {
    return this._service.estaLogado();
  }
}
