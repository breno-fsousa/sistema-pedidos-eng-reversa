class ProdutoFactory {
  /**
   * Cria um Produto a partir de um ID do catálogo.
   * Lança erro se o produto não existir.
   */
  static criar(id) {
    const dados = Produto.CATALOGO[id];
    if (!dados) {
      throw new Error(`Produto desconhecido: "${id}"`);
    }
    return new Produto(dados.id, dados.nome, dados.preco);
  }
}

// -------------------------------------------------------

class ItemPedidoFactory {
  /**
   * Cria um ItemPedido a partir do id do produto e quantidade.
   * Valida a quantidade antes de delegar à ProdutoFactory.
   */
  static criar(produtoId, quantidade) {
    const qtd = parseInt(quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) {
      throw new Error("Quantidade inválida");
    }
    const produto = ProdutoFactory.criar(produtoId);
    return new ItemPedido(produto, qtd);
  }
}


class PedidoFactory {
  /**
   * Cria um novo Pedido com ID baseado em timestamp.
   */
  static criar() {
    return new Pedido(Date.now().toString());
  }
}
