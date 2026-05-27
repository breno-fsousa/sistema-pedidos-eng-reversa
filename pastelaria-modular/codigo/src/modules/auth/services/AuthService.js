/**
 * MODULE: auth
 * LAYER: services
 * FILE: AuthService.js
 *
 * Responsabilidade: Regras de negócio de autenticação.
 * Valida credenciais, gera tokens e gerencia sessão.
 */
class AuthService {
  constructor() {
    this._repository = new AuthRepository();
    this._bus        = new EventBus();

    // Base de usuários fake — em produção viria da API
    this._usuariosFake = {
      admin:     new Usuario({ id: "u1", nome: "Administrador", papel: Usuario.PAPEIS.ADMIN }),
      atendente: new Usuario({ id: "u2", nome: "Atendente",     papel: Usuario.PAPEIS.ATENDENTE }),
    };
    this._SENHA_FAKE = "1234";
  }

  /**
   * Tenta autenticar um usuário.
   * @param {string} login
   * @param {string} senha
   * @returns {{ ok: boolean, usuario: Usuario|null, erro: string|null }}
   */
  login(login, senha) {
    const usuario = this._usuariosFake[login];
    if (!usuario || senha !== this._SENHA_FAKE) {
      Logger.warn("AuthService", "Falha de login", { login });
      return { ok: false, usuario: null, erro: "Usuário ou senha inválidos" };
    }

    const token = `token-${usuario.getId()}-${Date.now()}`;
    this._repository.salvarSessao(token, usuario);

    Logger.info("AuthService", "Login realizado com sucesso", { nome: usuario.getNome() });
    this._bus.emit(EVENTOS.USUARIO_LOGADO, usuario.toJSON());

    return { ok: true, usuario, erro: null };
  }

  logout() {
    this._repository.limparSessao();
    Logger.info("AuthService", "Logout realizado");
    this._bus.emit(EVENTOS.USUARIO_DESLOGADO, null);
  }

  getUsuarioAtual() {
    return this._repository.carregarUsuario();
  }

  estaLogado() {
    return this._repository.temSessaoAtiva();
  }
}
