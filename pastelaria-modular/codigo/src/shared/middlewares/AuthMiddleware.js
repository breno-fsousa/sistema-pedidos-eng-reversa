/**
 * SHARED / MIDDLEWARES: AuthMiddleware  (Padrão Middleware)
 *
 * Responsabilidade: Interceptar ações antes que cheguem aos controllers,
 * verificando se o usuário está autenticado.
 *
 * O que é um Middleware no contexto de frontend?
 *   É uma função (ou objeto) que se posiciona ENTRE a View e o Controller,
 *   interceptando chamadas para verificar pré-condições antes de deixar
 *   a ação prosseguir. Inspirado no pipeline de middlewares de frameworks
 *   backend como Express.js.
 *
 * Fluxo com middleware:
 *   View → AuthMiddleware.verificar() → Controller.acao()
 *                  ↓ (falha)
 *              Rejeita / redireciona
 *
 * Aqui usamos autenticação FAKE para simular o conceito sem backend real.
 * Em produção, verificaria um JWT válido ou sessão no servidor.
 */
class AuthMiddleware {
  constructor() {
    this._config = new AppConfig();
    this._tokenKey = this._config.get("AUTH_TOKEN_KEY");
    this._userKey  = this._config.get("AUTH_USER_KEY");
  }

  // ================================================================
  // Autenticação fake (simula login sem backend real)
  // ================================================================

  /**
   * Simula login: gera um token fake e salva na sessão.
   * @param {string} usuario
   * @param {string} senha
   * @returns {{ ok: boolean, usuario: object|null, erro: string|null }}
   */
  login(usuario, senha) {
    // Credenciais fake aceitas
    const USUARIOS_FAKE = {
      admin:     { id: "u1", nome: "Administrador", papel: "admin" },
      atendente: { id: "u2", nome: "Atendente",     papel: "atendente" },
    };
    const SENHA_FAKE = "1234";

    if (!USUARIOS_FAKE[usuario] || senha !== SENHA_FAKE) {
      Logger.warn("AuthMiddleware", "Tentativa de login inválida", { usuario });
      return { ok: false, usuario: null, erro: "Usuário ou senha inválidos" };
    }

    const dadosUsuario = USUARIOS_FAKE[usuario];
    const token = `fake-token-${dadosUsuario.id}-${Date.now()}`;

    try {
      sessionStorage.setItem(this._tokenKey, token);
      sessionStorage.setItem(this._userKey, JSON.stringify(dadosUsuario));
    } catch (_) { /* sessionStorage indisponível (testes Node) */ }

    Logger.info("AuthMiddleware", "Login realizado", { usuario: dadosUsuario.nome });
    const bus = new EventBus();
    bus.emit(EVENTOS.USUARIO_LOGADO, dadosUsuario);

    return { ok: true, usuario: dadosUsuario, erro: null };
  }

  /**
   * Encerra a sessão do usuário.
   */
  logout() {
    try {
      sessionStorage.removeItem(this._tokenKey);
      sessionStorage.removeItem(this._userKey);
    } catch (_) { /* sessionStorage indisponível */ }

    Logger.info("AuthMiddleware", "Logout realizado");
    const bus = new EventBus();
    bus.emit(EVENTOS.USUARIO_DESLOGADO, null);
  }

  /**
   * Verifica se há uma sessão ativa.
   * @returns {boolean}
   */
  estaLogado() {
    try {
      return !!sessionStorage.getItem(this._tokenKey);
    } catch {
      return false;
    }
  }

  /**
   * Retorna os dados do usuário logado, ou null.
   * @returns {object|null}
   */
  getUsuarioAtual() {
    try {
      const raw = sessionStorage.getItem(this._userKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ================================================================
  // Middleware de interceptação
  // ================================================================

  /**
   * Executa uma ação somente se o usuário estiver autenticado.
   * Caso contrário, emite um evento de erro.
   *
   * Uso:
   *   authMiddleware.proteger(() => controller.finalizar(...))
   *
   * @param {Function} acao - função a executar se autenticado
   * @param {string}   papelExigido - papel mínimo ("atendente"|"admin") — opcional
   * @returns {boolean} true se a ação foi executada
   */
  proteger(acao, papelExigido = null) {
    if (!this.estaLogado()) {
      Logger.warn("AuthMiddleware", "Acesso negado — usuário não autenticado");
      const bus = new EventBus();
      bus.emit(EVENTOS.ERRO, "Acesso negado. Faça login para continuar.");
      return false;
    }

    if (papelExigido) {
      const usuario = this.getUsuarioAtual();
      if (!usuario || !this._papelPermitido(usuario.papel, papelExigido)) {
        Logger.warn("AuthMiddleware", "Acesso negado — papel insuficiente", {
          papelUsuario: usuario?.papel,
          papelExigido,
        });
        const bus = new EventBus();
        bus.emit(EVENTOS.ERRO, `Acesso negado. Papel "${papelExigido}" necessário.`);
        return false;
      }
    }

    acao();
    return true;
  }

  /**
   * Verifica se o papel do usuário é suficiente para a ação.
   */
  _papelPermitido(papelUsuario, papelExigido) {
    const hierarquia = { atendente: 1, admin: 2 };
    return (hierarquia[papelUsuario] ?? 0) >= (hierarquia[papelExigido] ?? 0);
  }
}
