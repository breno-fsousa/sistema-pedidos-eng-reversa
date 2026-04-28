class ItemPedido {
  constructor(produto, quantidade) {
    if (!(produto instanceof Produto)) {
      throw new Error("ItemPedido requer uma instância de Produto");
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error("Quantidade deve ser um inteiro positivo");
    }

    this.produto = produto;
    this.quantidade = quantidade;
  }

  getSubtotal() {
    return this.produto.getPreco() * this.quantidade;
  }

  toJSON() {
    return {
      produtoId: this.produto.id,
      nomeProduto: this.produto.getNome(),
      preco: this.produto.getPreco(),
      quantidade: this.quantidade,
      subtotal: this.getSubtotal(),
    };
  }
}
