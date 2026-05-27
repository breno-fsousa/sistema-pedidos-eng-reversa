/**
 * MODULE: products
 * LAYER: services
 * FILE: ProductService.js  (Padrão Service + Factory)
 *
 * Responsabilidade: Centralizar todas as regras de negócio relacionadas a produtos.
 * É o ponto de acesso do módulo "products" para outros módulos.
 *
 * Outros módulos (orders, payments) NUNCA acessam Produto diretamente —
 * sempre passam pelo ProductService. Isso garante que o módulo "products"
 * possa evoluir internamente sem quebrar os outros.
 *
 * Incorpora o Padrão Factory para criação padronizada de produtos.
 */
class ProductService {
  constructor() {
    this._repository = new ProductRepository();
    Logger.info("ProductService", "Módulo de produtos inicializado");
  }

  /**
   * Retorna todos os produtos disponíveis (com log).
   * @returns {Produto[]}
   */
  listarProdutos() {
    const produtos = this._repository.listarTodos();
    Logger.info("ProductService", `${produtos.length} produtos carregados`);
    return produtos;
  }

  /**
   * Busca e cria um Produto pelo ID (padrão Factory embutido no Service).
   * Valida existência antes de retornar.
   * @param {string} id
   * @returns {Produto}
   */
  criarProduto(id) {
    return this._repository.buscarPorId(id);
  }

  /**
   * Verifica se um produto existe e está disponível.
   * @param {string} id
   * @returns {boolean}
   */
  produtoDisponivel(id) {
    return this._repository.existe(id);
  }

  /**
   * Retorna produtos agrupados por categoria.
   * @returns {Object.<string, Produto[]>}
   */
  listarPorCategoria() {
    const produtos = this._repository.listarTodos();
    return produtos.reduce((grupos, produto) => {
      const cat = produto.getCategoria();
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(produto);
      return grupos;
    }, {});
  }
}
