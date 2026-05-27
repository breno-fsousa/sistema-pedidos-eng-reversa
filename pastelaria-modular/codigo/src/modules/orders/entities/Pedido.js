/**
 * MODULE: orders
 * LAYER: entities
 * FILE: Pedido.js
 *
 * Responsabilidade: Entidade central do módulo de pedidos.
 * Agrega itens, controla o ciclo de vida e calcula o total bruto.
 *
 * A entidade conhece apenas seus próprios dados e comportamento.
 * Não sabe de descontos, taxas, persistência ou interface.
 */
class Pedido {
  constructor(id) {
    this._id       = id || Formatters.gerarId();
    this._itens    = [];
    this._criadoEm = new Date().toISOString();
    this._status   = Pedido.STATUS.ABERTO;
  }

  // ---- Getters ----

  getId()       { return this._id;       }
  getStatus()   { return this._status;   }
  getCriadoEm() { return this._criadoEm; }
  temItens()    { return this._itens.length > 0; }

  getItens() {
    return [...this._itens]; // cópia defensiva — imutabilidade externa
  }

  // ---- Cálculo ----

  getTotal() {
    return this._itens.reduce((soma, item) => soma + item.getSubtotal(), 0);
  }

  // ---- Gerenciamento de itens ----

  adicionarItem(itemPedido) {
    if (!(itemPedido instanceof ItemPedido)) {
      throw new Error("Pedido: esperado uma instância de ItemPedido");
    }
    if (this._status !== Pedido.STATUS.ABERTO) {
      throw new Error("Pedido: não é possível adicionar itens a um pedido finalizado");
    }
    this._itens.push(itemPedido);
  }

  removerUltimoItem() {
    if (this._itens.length === 0) return;
    this._itens.pop();
  }

  limpar() {
    this._itens  = [];
    this._status = Pedido.STATUS.ABERTO;
  }

  // ---- Ciclo de vida ----

  finalizar() {
    if (this._status !== Pedido.STATUS.ABERTO) {
      throw new Error("Pedido: já foi finalizado");
    }
    if (!this.temItens()) {
      throw new Error("Pedido: não é possível finalizar um pedido sem itens");
    }
    this._status = Pedido.STATUS.FINALIZADO;
  }

  cancelar() {
    if (this._status === Pedido.STATUS.FINALIZADO) {
      throw new Error("Pedido: não é possível cancelar um pedido já finalizado");
    }
    this._status = Pedido.STATUS.CANCELADO;
  }

  // ---- Serialização ----

  toJSON() {
    return {
      id:       this._id,
      criadoEm: this._criadoEm,
      status:   this._status,
      itens:    this._itens.map((i) => i.toJSON()),
      total:    this.getTotal(),
    };
  }
}

/** Constantes de status — evita strings mágicas no código. */
Pedido.STATUS = Object.freeze({
  ABERTO:     "aberto",
  FINALIZADO: "finalizado",
  CANCELADO:  "cancelado",
});
