/**
 * MODEL: Produto
 *
 * Responsabilidade: Entidade de domínio que representa um produto do cardápio.
 * Contém apenas dados e comportamento inerente ao produto.
 * Não acessa DOM, serviços ou repositórios.
 */
class Produto {
  constructor(id, nome, preco) {
    if (!id || typeof id !== "string") {
      throw new Error("Produto requer um id válido");
    }
    if (!nome || typeof nome !== "string") {
      throw new Error("Produto requer um nome válido");
    }
    if (typeof preco !== "number" || preco <= 0) {
      throw new Error("Produto requer um preço positivo");
    }

    this.id    = id;
    this.nome  = nome;
    this.preco = preco;
  }

  getId()    { return this.id;    }
  getNome()  { return this.nome;  }
  getPreco() { return this.preco; }

  toJSON() {
    return { id: this.id, nome: this.nome, preco: this.preco };
  }
}

/**
 * Catálogo estático de produtos disponíveis na pastelaria.
 * Centraliza a definição dos itens vendidos.
 */
Produto.CATALOGO = {
  pastel:       { id: "pastel",       nome: "Pastel",       preco: 5 },
  caldo:        { id: "caldo",        nome: "Caldo",        preco: 7 },
  refrigerante: { id: "refrigerante", nome: "Refrigerante", preco: 4 },
  suco:         { id: "suco",         nome: "Suco",         preco: 6 },
};
