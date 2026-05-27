/**
 * SHARED / UTILS: Formatters
 *
 * Responsabilidade: Centralizar funções puras de formatação de dados.
 * Evita duplicação de lógica de apresentação entre módulos.
 *
 * Funções puras: sem efeitos colaterais, sem dependências externas.
 * Fáceis de testar e reutilizar em qualquer módulo.
 */
const Formatters = Object.freeze({
  /**
   * Formata um número como moeda brasileira (R$ X,XX).
   * @param {number} valor
   * @returns {string}
   */
  moeda(valor) {
    if (typeof valor !== "number") return "R$ 0,00";
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
  },

  /**
   * Formata uma data ISO como string legível (DD/MM/YYYY HH:MM).
   * @param {string} isoString
   * @returns {string}
   */
  dataHora(isoString) {
    try {
      const d = new Date(isoString);
      const dd   = String(d.getDate()).padStart(2, "0");
      const mm   = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh   = String(d.getHours()).padStart(2, "0");
      const min  = String(d.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch {
      return isoString;
    }
  },

  /**
   * Gera um ID único baseado em timestamp + número aleatório.
   * @returns {string}
   */
  gerarId() {
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  },

  /**
   * Trunca um texto longo, adicionando reticências.
   * @param {string} texto
   * @param {number} limite
   * @returns {string}
   */
  truncar(texto, limite = 40) {
    if (!texto || texto.length <= limite) return texto;
    return texto.slice(0, limite) + "…";
  },

  /**
   * Formata número de telefone para exibição (55 88 9 9999-9999).
   * @param {string} telefone
   * @returns {string}
   */
  telefone(telefone) {
    const digits = String(telefone).replace(/\D/g, "");
    if (digits.length === 13) {
      // DDI(2) + DDD(2) + 9(1) + número(8)
      return `+${digits.slice(0,2)} (${digits.slice(2,4)}) ${digits.slice(4,5)} ${digits.slice(5,9)}-${digits.slice(9)}`;
    }
    return telefone;
  },
});
