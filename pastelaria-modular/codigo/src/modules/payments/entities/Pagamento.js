/**
 * MODULE: payments
 * LAYER: entities
 * FILE: Pagamento.js
 *
 * Responsabilidade: Representa um pagamento associado a um pedido.
 * Contém o resultado financeiro do processamento (aprovado/recusado)
 * e o método de pagamento utilizado.
 */
class Pagamento {
  constructor({ pedidoId, valor, metodo = "dinheiro", status = Pagamento.STATUS.PENDENTE }) {
    if (!pedidoId) throw new Error("Pagamento: pedidoId é obrigatório");
    if (typeof valor !== "number" || valor <= 0) {
      throw new Error("Pagamento: valor deve ser um número positivo");
    }

    this._id        = Formatters.gerarId();
    this._pedidoId  = pedidoId;
    this._valor     = valor;
    this._metodo    = metodo;
    this._status    = status;
    this._criadoEm  = new Date().toISOString();
  }

  getId()       { return this._id;       }
  getPedidoId() { return this._pedidoId; }
  getValor()    { return this._valor;    }
  getMetodo()   { return this._metodo;   }
  getStatus()   { return this._status;   }

  aprovar() {
    this._status = Pagamento.STATUS.APROVADO;
  }

  recusar() {
    this._status = Pagamento.STATUS.RECUSADO;
  }

  toJSON() {
    return {
      id:        this._id,
      pedidoId:  this._pedidoId,
      valor:     this._valor,
      metodo:    this._metodo,
      status:    this._status,
      criadoEm:  this._criadoEm,
    };
  }
}

Pagamento.STATUS = Object.freeze({
  PENDENTE:  "pendente",
  APROVADO:  "aprovado",
  RECUSADO:  "recusado",
});

Pagamento.METODOS = Object.freeze({
  DINHEIRO:  "dinheiro",
  CARTAO:    "cartao",
  PIX:       "pix",
});
