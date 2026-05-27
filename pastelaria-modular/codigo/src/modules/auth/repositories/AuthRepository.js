/**
 * MODULE: auth
 * LAYER: repositories
 * FILE: AuthRepository.js  (Padrão Repository + Singleton)
 *
 * Responsabilidade: Abstrair o acesso ao armazenamento de sessão do usuário.
 */
class AuthRepository {
  constructor() {
    if (AuthRepository._instancia) {
      return AuthRepository._instancia;
    }
    const config = new AppConfig();
    this._tokenKey = config.get("AUTH_TOKEN_KEY");
    this._userKey  = config.get("AUTH_USER_KEY");
    AuthRepository._instancia = this;
  }

  salvarSessao(token, usuario) {
    try {
      sessionStorage.setItem(this._tokenKey, token);
      sessionStorage.setItem(this._userKey, JSON.stringify(usuario.toJSON()));
    } catch (_) { /* sessionStorage pode estar bloqueado em Node */ }
  }

  carregarUsuario() {
    try {
      const raw = sessionStorage.getItem(this._userKey);
      if (!raw) return null;
      const dados = JSON.parse(raw);
      return new Usuario(dados);
    } catch {
      return null;
    }
  }

  temSessaoAtiva() {
    try {
      return !!sessionStorage.getItem(this._tokenKey);
    } catch {
      return false;
    }
  }

  limparSessao() {
    try {
      sessionStorage.removeItem(this._tokenKey);
      sessionStorage.removeItem(this._userKey);
    } catch (_) { /* ignorado */ }
  }
}

AuthRepository._instancia = null;
