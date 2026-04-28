class Produto {
  constructor(id, nome, preco) {
    this.id = id;
    this.nome = nome;
    this.preco = preco;
  }

  getPreco() {
    return this.preco;
  }

  getNome() {
    return this.nome;
  }
}

// Catálogo estático de produtos disponíveis
Produto.CATALOGO = {
  pastel:      { id: "pastel",      nome: "Pastel",      preco: 5 },
  caldo:       { id: "caldo",       nome: "Caldo",       preco: 7 },
  refrigerante:{ id: "refrigerante",nome: "Refrigerante",preco: 4 },
  suco:        { id: "suco",        nome: "Suco",        preco: 6 },
};
