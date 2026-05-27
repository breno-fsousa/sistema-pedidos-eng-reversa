/**
 * MODULE: orders
 * LAYER: entities
 * FILE: ItemPedido.js
 *
 * Responsabilidade: Representa um item dentro de um pedido.
 * Associa um Produto (do módulo products) a uma quantidade
 * e calcula o subtotal correspondente.
 *
 * Dependência cruzada controlada:
 *   ItemPedido usa Produto, mas não importa ProductService diretamente.
 *   O produto já chega instanciado via OrderService (que usa ProductService).
 *   Isso mantém o acoplamento entre módulos apenas nas camadas de Service.
 */
class ItemPedido {
  constructor(produto, quantidade) {
    if (!(produto instanceof Produto)) {
      throw new Error("ItemPedido: requer uma instância válida de Produto");
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error("ItemPedido: quantidade deve ser um inteiro positivo");
    }

    this._produto    = produto;
    this._quantidade = quantidade;
  }

  getProduto()    { return this._produto;    }
  getQuantidade() { return this._quantidade; }

  getSubtotal() {
    return this._produto.getPreco() * this._quantidade;
  }

  toJSON() {
    return {
      produtoId:   this._produto.getId(),
      nomeProduto: this._produto.getNome(),
      preco:       this._produto.getPreco(),
      quantidade:  this._quantidade,
      subtotal:    this.getSubtotal(),
    };
  }
}
