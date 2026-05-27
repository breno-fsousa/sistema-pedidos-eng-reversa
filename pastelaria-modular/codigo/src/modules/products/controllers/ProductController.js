/**
 * MODULE: products
 * LAYER: controllers
 * FILE: ProductController.js
 *
 * Responsabilidade: Receber requisições da View relacionadas a produtos,
 * acionar o ProductService e retornar respostas via EventBus.
 *
 * O controller NÃO contém regras de negócio — apenas coordena o fluxo:
 *   View → ProductController → ProductService → ProductRepository → Produto
 */
class ProductController {
  constructor() {
    this._service      = new ProductService();
    this._bus          = new EventBus();
    this._errorHandler = new ErrorHandler();
    Logger.info("ProductController", "Controlador de produtos iniciado");
  }

  /**
   * Lista todos os produtos e os retorna.
   * @returns {Produto[]}
   */
  listar() {
    return this._errorHandler.executar(
      () => this._service.listarProdutos(),
      "ProductController",
      ErrorHandler.TIPOS.SISTEMA
    );
  }

  /**
   * Retorna produtos agrupados por categoria.
   * @returns {Object}
   */
  listarPorCategoria() {
    return this._service.listarPorCategoria();
  }
}
