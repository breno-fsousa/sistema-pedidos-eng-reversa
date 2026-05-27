/**
 * MODULE: products
 * LAYER: repositories
 * FILE: ProductRepository.js  (Padrão Repository + Singleton)
 *
 * Responsabilidade: Abstrair o acesso aos dados de produtos.
 * Qualquer operação de leitura ou escrita de produtos passa por aqui.
 *
 * Atualmente usa o catálogo estático como "banco de dados".
 * Em produção, substituiria por chamadas à API sem alterar nenhum Service.
 */
class ProductRepository {
  constructor() {
    if (ProductRepository._instancia) {
      return ProductRepository._instancia;
    }
    this._config  = new AppConfig();
    this._apiUrl  = `${this._config.get("API_URL")}/produtos`;
    ProductRepository._instancia = this;
  }

  /**
   * Retorna todos os produtos disponíveis.
   * @returns {Produto[]}
   */
  listarTodos() {
    return Object.values(Produto.CATALOGO).map(
      (d) => new Produto(d.id, d.nome, d.preco, d.categoria)
    );
  }

  /**
   * Busca um produto pelo ID.
   * @param {string} id
   * @returns {Produto}
   */
  buscarPorId(id) {
    const dados = Produto.CATALOGO[id];
    if (!dados) {
      throw new Error(`Produto não encontrado: "${id}"`);
    }
    return new Produto(dados.id, dados.nome, dados.preco, dados.categoria);
  }

  /**
   * Verifica se um produto existe no catálogo.
   * @param {string} id
   * @returns {boolean}
   */
  existe(id) {
    return id in Produto.CATALOGO;
  }
}

ProductRepository._instancia = null;
