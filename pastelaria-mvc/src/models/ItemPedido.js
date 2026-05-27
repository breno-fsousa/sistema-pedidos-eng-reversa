/**
 * MODEL: ItemPedido
 *
 * Responsabilidade: Representa um item dentro de um pedido,
 * associando um Produto a uma quantidade.
 * Calcula seu próprio subtotal (comportamento da entidade).
 */
class ItemPedido {
  constructor(produto, quantidade) {
    if (!(produto instanceof Produto)) {
      throw new Error("ItemPedido requer uma instância válida de Produto");
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error("Quantidade deve ser um inteiro positivo");
    }

    this.produto    = produto;
    this.quantidade = quantidade;
  }

  getProduto()    { return this.produto;    }
  getQuantidade() { return this.quantidade; }

  getSubtotal() {
    return this.produto.getPreco() * this.quantidade;
  }

  toJSON() {
    return {
      produtoId:   this.produto.getId(),
      nomeProduto: this.produto.getNome(),
      preco:       this.produto.getPreco(),
      quantidade:  this.quantidade,
      subtotal:    this.getSubtotal(),
    };
  }
}
