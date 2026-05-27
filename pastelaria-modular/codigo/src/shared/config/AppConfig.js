/**
 * SHARED / CONFIG: AppConfig  (Padrão Singleton)
 *
 * Responsabilidade: Centralizar toda a configuração da aplicação em um único
 * ponto de acesso. Garante que qualquer módulo obtenha os mesmos valores de
 * configuração sem depender de variáveis globais espalhadas pelo código.
 *
 * Por que Singleton aqui?
 *   Em sistemas maiores, múltiplos módulos precisam de configurações (URLs de API,
 *   taxas, versão do sistema). Sem um Singleton, cada módulo manteria sua própria
 *   cópia, gerando inconsistências ao mudar um valor.
 *
 * Como usar:
 *   const config = new AppConfig();
 *   config.get("API_URL")  // → "http://localhost:3000"
 */
class AppConfig {
  constructor() {
    if (AppConfig._instancia) {
      return AppConfig._instancia;
    }

    this._config = {
      // API
      API_URL:          "http://localhost:3000",
      API_TIMEOUT_MS:   5000,

      // Regras financeiras (centralizadas aqui para fácil ajuste)
      TAXA_SERVICO:     0.05,   // 5%
      DESCONTO_MEDIO:   0.10,   // 10% — pedidos acima do limite médio
      DESCONTO_ALTO:    0.20,   // 20% — pedidos acima do limite alto
      LIMITE_DESCONTO_MEDIO: 50,
      LIMITE_DESCONTO_ALTO:  100,

      // Contatos padrão (fallback)
      TELEFONE_CLIENTE_PADRAO:       "5500000000000",
      TELEFONE_ESTABELECIMENTO_PADRAO: "5500000000001",

      // Auth fake
      AUTH_TOKEN_KEY:   "pastelaria_auth_token",
      AUTH_USER_KEY:    "pastelaria_auth_user",

      // Chaves de armazenamento
      STORAGE_PEDIDO_ATUAL:   "pastelaria_pedido_atual",
      STORAGE_ULTIMO_PEDIDO:  "pastelaria_ultimo_pedido",

      // Sistema
      VERSAO: "3.0.0",
      NOME_SISTEMA: "Pastelaria do Zé — Arquitetura Modular",
    };

    AppConfig._instancia = this;
  }

  /**
   * Obtém um valor de configuração pelo nome da chave.
   * @param {string} chave
   * @returns {*}
   */
  get(chave) {
    if (!(chave in this._config)) {
      console.warn(`AppConfig: chave desconhecida "${chave}"`);
      return undefined;
    }
    return this._config[chave];
  }

  /**
   * Retorna uma cópia de toda a configuração (somente leitura).
   * @returns {object}
   */
  getAll() {
    return { ...this._config };
  }
}

AppConfig._instancia = null;
