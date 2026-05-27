/**
 * REPOSITORY: PedidoRepository  (Padrão Repository + Singleton)
 *
 * Responsabilidade: Abstrair completamente o acesso e a persistência de dados.
 * Toda comunicação com armazenamento (localStorage ou API) passa por aqui.
 *
 * Singleton: garante uma única instância gerenciando a persistência,
 * evitando inconsistências de estado entre diferentes partes do sistema.
 *
 * Repository: isola a camada de dados. Se o backend mudar (de localStorage
 * para IndexedDB, Firebase ou outro), apenas este arquivo muda.
 *
 * Camadas superiores (Service, Controller) não sabem COMO os dados são
 * armazenados — só sabem que podem salvar e carregar.
 */
class PedidoRepository {
  constructor() {
    // Singleton: impede segunda instância
    if (PedidoRepository._instancia) {
      return PedidoRepository._instancia;
    }

    this.API_URL             = "http://localhost:3000/pedidos";
    this.CHAVE_PEDIDO_ATUAL  = "pastelaria_pedido_atual";
    this.CHAVE_ULTIMO_PEDIDO = "pastelaria_ultimo_pedido";

    PedidoRepository._instancia = this;
  }

  // ================================================================
  // localStorage — persistência local / offline
  // ================================================================

  /**
   * Persiste o pedido em andamento no localStorage.
   * Chamado após cada alteração (adicionar/remover item).
   * @param {Pedido} pedido
   */
  salvarPedidoLocal(pedido) {
    try {
      localStorage.setItem(this.CHAVE_PEDIDO_ATUAL, JSON.stringify(pedido.toJSON()));
    } catch (e) {
      console.warn("PedidoRepository: falha ao salvar no localStorage:", e.message);
    }
  }

  /**
   * Carrega o pedido em andamento salvo localmente.
   * Retorna null se não houver nenhum salvo.
   * @returns {object|null}
   */
  carregarPedidoLocal() {
    try {
      const raw = localStorage.getItem(this.CHAVE_PEDIDO_ATUAL);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("PedidoRepository: falha ao carregar do localStorage:", e.message);
      return null;
    }
  }

  /**
   * Salva o resumo do último pedido finalizado.
   * Usado para exibir histórico ou confirmação.
   * @param {object} resumo
   */
  salvarUltimoPedido(resumo) {
    try {
      localStorage.setItem(this.CHAVE_ULTIMO_PEDIDO, JSON.stringify(resumo));
    } catch (e) {
      console.warn("PedidoRepository: falha ao salvar último pedido:", e.message);
    }
  }

  /**
   * Retorna o último pedido finalizado salvo localmente.
   * @returns {object|null}
   */
  getUltimoPedido() {
    try {
      const raw = localStorage.getItem(this.CHAVE_ULTIMO_PEDIDO);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Remove o pedido em andamento do localStorage.
   * Chamado após finalizar ou limpar o pedido.
   */
  limparLocal() {
    try {
      localStorage.removeItem(this.CHAVE_PEDIDO_ATUAL);
    } catch (e) {
      console.warn("PedidoRepository: falha ao limpar localStorage:", e.message);
    }
  }

  // ================================================================
  // JSON Server — persistência via API fake
  // ================================================================

  /**
   * Envia o pedido finalizado para a API fake (JSON Server).
   * Falha silenciosa: a API offline não deve impedir o fluxo do usuário.
   * @param {Pedido} pedido
   * @returns {Promise<object|null>}
   */
  async salvarPedidoAPI(pedido) {
    try {
      const resposta = await fetch(this.API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(pedido.toJSON()),
      });
      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`);
      }
      return await resposta.json();
    } catch (e) {
      // API offline é tolerável — apenas registra no console
      console.warn("PedidoRepository: API indisponível —", e.message);
      return null;
    }
  }

  /**
   * Lista todos os pedidos salvos na API fake.
   * @returns {Promise<object[]>}
   */
  async listarPedidosAPI() {
    try {
      const resposta = await fetch(this.API_URL);
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return await resposta.json();
    } catch (e) {
      console.warn("PedidoRepository: API indisponível —", e.message);
      return [];
    }
  }
}

// Garante singleton mesmo sem módulos ES
PedidoRepository._instancia = null;
