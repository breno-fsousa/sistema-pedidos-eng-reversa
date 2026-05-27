/**
 * FACTORIES (Padrão Factory)
 *
 * Responsabilidade: Centralizar e padronizar a criação de objetos de domínio.
 * Evita instanciação direta espalhada pelo código e garante validações
 * consistentes no momento da criação.
 *
 * Aplicação do padrão:
 *  - ProdutoFactory   → cria Produto a partir do catálogo
 *  - ItemPedidoFactory → cria ItemPedido com validação de quantidade
 *  - PedidoFactory    → cria Pedido com ID automático
 */

// -------------------------------------------------------
// ProdutoFactory
// -------------------------------------------------------
class ProdutoFactory {
  /**
   * Cria um Produto a partir de um ID do catálogo estático.
   * Lança erro descritivo se o produto não existir.
   * @param {string} id
   * @returns {Produto}
   */
  static criar(id) {
    const dados = Produto.CATALOGO[id];
    if (!dados) {
      throw new Error(`Produto desconhecido: "${id}". Verifique o catálogo.`);
    }
    return new Produto(dados.id, dados.nome, dados.preco);
  }

  /**
   * Retorna todos os produtos do catálogo como instâncias de Produto.
   * @returns {Produto[]}
   */
  static listarTodos() {
    return Object.values(Produto.CATALOGO).map(
      (d) => new Produto(d.id, d.nome, d.preco)
    );
  }
}

// -------------------------------------------------------
// ItemPedidoFactory
// -------------------------------------------------------
class ItemPedidoFactory {
  /**
   * Cria um ItemPedido após validar a quantidade e buscar o produto no catálogo.
   * @param {string} produtoId
   * @param {number|string} quantidade
   * @returns {ItemPedido}
   */
  static criar(produtoId, quantidade) {
    const qtd = parseInt(quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) {
      throw new Error("Quantidade inválida. Informe um número inteiro maior que zero.");
    }
    const produto = ProdutoFactory.criar(produtoId);
    return new ItemPedido(produto, qtd);
  }
}

// -------------------------------------------------------
// PedidoFactory
// -------------------------------------------------------
class PedidoFactory {
  /**
   * Cria um novo Pedido vazio com ID baseado em timestamp.
   * @returns {Pedido}
   */
  static criar() {
    return new Pedido(Date.now().toString());
  }
}
