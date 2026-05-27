/**
 * MODULE: products
 * LAYER: entities
 * FILE: Produto.js
 *
 * Responsabilidade: Entidade central do módulo de produtos.
 * Representa um produto do cardápio com seus atributos e comportamentos próprios.
 *
 * Na arquitetura modular, a entidade vive DENTRO do módulo que a domina.
 * Apenas o módulo "products" é dono desta classe. Outros módulos que precisam
 * de dados de produto devem acessar via ProductService — nunca diretamente.
 */
class Produto {
  constructor(id, nome, preco, categoria = "geral", disponivel = true) {
    if (!id || typeof id !== "string") {
      throw new Error("Produto: id deve ser uma string não vazia");
    }
    if (!nome || typeof nome !== "string") {
      throw new Error("Produto: nome deve ser uma string não vazia");
    }
    if (typeof preco !== "number" || preco <= 0) {
      throw new Error("Produto: preço deve ser um número positivo");
    }

    this.id         = id;
    this.nome       = nome;
    this.preco      = preco;
    this.categoria  = categoria;
    this.disponivel = disponivel;
  }

  getId()          { return this.id;         }
  getNome()        { return this.nome;        }
  getPreco()       { return this.preco;       }
  getCategoria()   { return this.categoria;   }
  estaDisponivel() { return this.disponivel;  }

  toJSON() {
    return {
      id:         this.id,
      nome:       this.nome,
      preco:      this.preco,
      categoria:  this.categoria,
      disponivel: this.disponivel,
    };
  }
}

/**
 * Catálogo estático — fonte de verdade dos produtos da Pastelaria do Zé.
 * Em produção, viria do ProductRepository (API ou banco de dados).
 */
Produto.CATALOGO = Object.freeze({
  pastel:       { id: "pastel",       nome: "Pastel",       preco: 5,  categoria: "salgado" },
  caldo:        { id: "caldo",        nome: "Caldo",        preco: 7,  categoria: "salgado" },
  refrigerante: { id: "refrigerante", nome: "Refrigerante", preco: 4,  categoria: "bebida"  },
  suco:         { id: "suco",         nome: "Suco",         preco: 6,  categoria: "bebida"  },
});
