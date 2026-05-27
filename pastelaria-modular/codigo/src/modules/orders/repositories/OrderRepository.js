/**
 * MODULE: orders
 * LAYER: repositories
 * FILE: OrderRepository.js  (Padrão Repository + Singleton)
 *
 * Responsabilidade: Abstrair completamente o acesso e a persistência de pedidos.
 * Todo armazenamento (localStorage e JSON Server) é tratado aqui.
 *
 * Outros módulos nunca acessam localStorage ou fetch diretamente para pedidos —
 * tudo passa por este repositório. Isso permite trocar o mecanismo de
 * persistência sem alterar nenhuma outra camada do sistema.
 */
class OrderRepository {
  constructor() {
    if (OrderRepository._instancia) {
      return OrderRepository._instancia;
    }
    const config = new AppConfig();
    this._apiUrl          = `${config.get("API_URL")}/pedidos`;
    this._chavePedidoAtual  = config.get("STORAGE_PEDIDO_ATUAL");
    this._chaveUltimoPedido = config.get("STORAGE_ULTIMO_PEDIDO");

    OrderRepository._instancia = this;
  }

  // ================================================================
  // localStorage — persistência local / recuperação de sessão
  // ================================================================

  /**
   * Persiste o pedido em andamento no localStorage.
   * Chamado após cada alteração (adicionar/remover item).
   * @param {Pedido} pedido
   */
  salvarPedidoLocal(pedido) {
    try {
      localStorage.setItem(this._chavePedidoAtual, JSON.stringify(pedido.toJSON()));
      Logger.info("OrderRepository", "Pedido salvo localmente", { id: pedido.getId() });
    } catch (e) {
      Logger.warn("OrderRepository", "Falha ao salvar no localStorage", e.message);
    }
  }

  /**
   * Recupera o pedido em andamento salvo localmente.
   * @returns {object|null}
   */
  carregarPedidoLocal() {
    try {
      const raw = localStorage.getItem(this._chavePedidoAtual);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      Logger.warn("OrderRepository", "Falha ao carregar do localStorage", e.message);
      return null;
    }
  }

  /**
   * Salva o resumo do último pedido finalizado.
   * @param {object} resumo
   */
  salvarUltimoPedido(resumo) {
    try {
      localStorage.setItem(this._chaveUltimoPedido, JSON.stringify(resumo));
    } catch (e) {
      Logger.warn("OrderRepository", "Falha ao salvar último pedido", e.message);
    }
  }

  /**
   * Retorna o resumo do último pedido finalizado.
   * @returns {object|null}
   */
  getUltimoPedido() {
    try {
      const raw = localStorage.getItem(this._chaveUltimoPedido);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Remove o pedido em andamento do localStorage.
   */
  limparLocal() {
    try {
      localStorage.removeItem(this._chavePedidoAtual);
      Logger.info("OrderRepository", "Pedido local removido");
    } catch (e) {
      Logger.warn("OrderRepository", "Falha ao limpar localStorage", e.message);
    }
  }

  // ================================================================
  // JSON Server — persistência remota (API fake)
  // ================================================================

  /**
   * Envia o pedido finalizado para o JSON Server.
   * Falha silenciosa: API offline não interrompe o fluxo do usuário.
   * @param {Pedido} pedido
   * @returns {Promise<object|null>}
   */
  async salvarPedidoAPI(pedido) {
    try {
      const resposta = await fetch(this._apiUrl, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(pedido.toJSON()),
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const resultado = await resposta.json();
      Logger.info("OrderRepository", "Pedido salvo na API", { id: pedido.getId() });
      return resultado;
    } catch (e) {
      Logger.warn("OrderRepository", "API indisponível — pedido salvo apenas localmente", e.message);
      return null;
    }
  }

  /**
   * Lista todos os pedidos salvos na API.
   * @returns {Promise<object[]>}
   */
  async listarPedidosAPI() {
    try {
      const resposta = await fetch(this._apiUrl);
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return await resposta.json();
    } catch (e) {
      Logger.warn("OrderRepository", "API indisponível", e.message);
      return [];
    }
  }
}

OrderRepository._instancia = null;
