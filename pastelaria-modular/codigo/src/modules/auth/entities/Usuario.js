/**
 * MODULE: auth
 * LAYER: entities
 * FILE: Usuario.js
 *
 * Responsabilidade: Entidade que representa um usuário do sistema.
 * Contém os dados de identificação e o papel (role) do usuário.
 */
class Usuario {
  constructor({ id, nome, papel, criadoEm }) {
    if (!id)   throw new Error("Usuario: id é obrigatório");
    if (!nome) throw new Error("Usuario: nome é obrigatório");

    this._id       = id;
    this._nome     = nome;
    this._papel    = papel || "atendente";
    this._criadoEm = criadoEm || new Date().toISOString();
  }

  getId()       { return this._id;       }
  getNome()     { return this._nome;     }
  getPapel()    { return this._papel;    }
  getCriadoEm() { return this._criadoEm; }

  isAdmin()     { return this._papel === "admin"; }

  toJSON() {
    return {
      id:       this._id,
      nome:     this._nome,
      papel:    this._papel,
      criadoEm: this._criadoEm,
    };
  }
}

Usuario.PAPEIS = Object.freeze({
  ADMIN:     "admin",
  ATENDENTE: "atendente",
});
