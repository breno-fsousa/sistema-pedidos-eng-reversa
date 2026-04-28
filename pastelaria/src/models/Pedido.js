class Pedido {
  constructor(id) {
    this.id = id || Date.now().toString();
    this.itens = [];
    this.criadoEm = new Date().toISOString();
    this.status = "aberto"; // aberto | finalizado
  }

  adicionarItem(itemPedido) {
    if (!(itemPedido instanceof ItemPedido)) {
      throw new Error("Esperado uma instância de ItemPedido");
    }
    this.itens.push(itemPedido);
  }

  removerUltimoItem() {
    this.itens.pop();
  }

  getTotal() {
    return this.itens.reduce((acc, item) => acc + item.getSubtotal(), 0);
  }

  getItens() {
    return this.itens;
  }

  finalizar() {
    this.status = "finalizado";
  }

  limpar() {
    this.itens = [];
  }

  toJSON() {
    return {
      id: this.id,
      criadoEm: this.criadoEm,
      status: this.status,
      itens: this.itens.map((i) => i.toJSON()),
      total: this.getTotal(),
    };
  }
}
