/**
 * MODEL: Pedido
 *
 * Responsabilidade: Entidade central do domínio.
 * Agrega itens, controla status e calcula o total bruto.
 * Não conhece regras de desconto, taxas ou persistência.
 */
class Pedido {
  constructor(id) {
    this.id        = id || Date.now().toString();
    this.itens     = [];
    this.criadoEm  = new Date().toISOString();
    this.status    = "aberto"; // "aberto" | "finalizado"
  }

  getId()        { return this.id;     }
  getStatus()    { return this.status; }
  getCriadoEm()  { return this.criadoEm; }

  // ---- Gerenciamento de itens ----

  adicionarItem(itemPedido) {
    if (!(itemPedido instanceof ItemPedido)) {
      throw new Error("Esperado uma instância de ItemPedido");
    }
    this.itens.push(itemPedido);
  }

  removerUltimoItem() {
    if (this.itens.length === 0) return;
    this.itens.pop();
  }

  getItens() {
    return [...this.itens]; // cópia defensiva
  }

  temItens() {
    return this.itens.length > 0;
  }

  // ---- Cálculo ----

  getTotal() {
    return this.itens.reduce((acc, item) => acc + item.getSubtotal(), 0);
  }

  // ---- Ciclo de vida ----

  finalizar() {
    if (this.status === "finalizado") {
      throw new Error("Pedido já foi finalizado");
    }
    this.status = "finalizado";
  }

  limpar() {
    this.itens  = [];
    this.status = "aberto";
  }

  // ---- Serialização ----

  toJSON() {
    return {
      id:       this.id,
      criadoEm: this.criadoEm,
      status:   this.status,
      itens:    this.itens.map((i) => i.toJSON()),
      total:    this.getTotal(),
    };
  }
}
