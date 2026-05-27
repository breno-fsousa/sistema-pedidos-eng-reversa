/**
 * SERVICE: PedidoService
 *
 * Responsabilidade: Concentrar todas as regras de negócio relacionadas ao pedido.
 *
 * O que faz:
 *   - Adicionar / remover itens no pedido (via factories)
 *   - Calcular resumo financeiro (subtotal, desconto, taxa, total final)
 *   - Finalizar pedido (delegando status ao model)
 *   - Gerar mensagem de WhatsApp
 *   - Limpar pedido
 *
 * O que NÃO faz:
 *   - Não acessa DOM
 *   - Não persiste dados (responsabilidade do Repository)
 *   - Não emite eventos (responsabilidade do Controller)
 *   - Não conhece a View
 *
 * Depende de:
 *   - Pedido (Model)
 *   - ItemPedidoFactory (criação de itens)
 *   - DescontoService (cálculo de desconto via Strategy)
 */
class PedidoService {
  constructor(pedido) {
    if (!(pedido instanceof Pedido)) {
      throw new Error("PedidoService requer uma instância válida de Pedido");
    }
    this._pedido       = pedido;
    this.TAXA_SERVICO  = 0.05; // 5%
  }

  // ---- Acesso ao modelo ----

  getPedido() { return this._pedido; }

  getItens()  { return this._pedido.getItens(); }

  getTotal()  { return this._pedido.getTotal(); }

  // ---- Manipulação de itens ----

  /**
   * Cria e adiciona um item ao pedido, validando produto e quantidade.
   * Delega criação à ItemPedidoFactory (padrão Factory).
   * @param {string}        produtoId
   * @param {number|string} quantidade
   * @returns {ItemPedido}
   */
  adicionarItem(produtoId, quantidade) {
    const item = ItemPedidoFactory.criar(produtoId, quantidade);
    this._pedido.adicionarItem(item);
    return item;
  }

  /**
   * Remove o último item adicionado ao pedido.
   */
  removerUltimoItem() {
    this._pedido.removerUltimoItem();
  }

  /**
   * Limpa todos os itens do pedido.
   */
  limpar() {
    this._pedido.limpar();
  }

  // ---- Cálculo financeiro ----

  /**
   * Calcula e retorna o resumo financeiro completo do pedido.
   * Aplica a estratégia de desconto adequada e a taxa de serviço.
   *
   * @returns {{
   *   subtotal:          number,
   *   desconto:          number,
   *   descricaoDesconto: string,
   *   percentualDesconto:number,
   *   taxaServico:       number,
   *   totalFinal:        number
   * }}
   */
  calcularResumo() {
    const subtotal = this._pedido.getTotal();

    // Delega ao DescontoService (Strategy)
    const desconto = DescontoService.calcular(subtotal);

    const taxaServico = subtotal * this.TAXA_SERVICO;
    const totalFinal  = subtotal - desconto.valor + taxaServico;

    return {
      subtotal,
      desconto:          desconto.valor,
      descricaoDesconto: desconto.descricao,
      percentualDesconto:desconto.percentual,
      taxaServico,
      totalFinal,
    };
  }

  // ---- Ciclo de vida ----

  /**
   * Finaliza o pedido: calcula o resumo e muda o status do model.
   * @returns {object} resumo financeiro
   */
  finalizar() {
    if (!this._pedido.temItens()) {
      throw new Error("Não é possível finalizar um pedido sem itens.");
    }
    const resumo = this.calcularResumo();
    this._pedido.finalizar();
    return resumo;
  }

  // ---- WhatsApp ----

  /**
   * Gera a URL de envio via WhatsApp com o resumo do pedido formatado.
   * @param {object} resumo  - retornado por calcularResumo()
   * @param {string} telefone - número com DDI (ex: 5588999999999)
   * @returns {string} URL wa.me
   */
  gerarMensagemWhatsApp(resumo, telefone) {
    const linhasItens = this._pedido
      .getItens()
      .map(
        (i) =>
          `- ${i.getProduto().getNome()} x${i.getQuantidade()} = R$ ${i
            .getSubtotal()
            .toFixed(2)}`
      )
      .join("%0A");

    const linhas = [
      `*🍴 Pedido - Pastelaria do Zé*`,
      ``,
      linhasItens,
      ``,
      `Subtotal: R$ ${resumo.subtotal.toFixed(2)}`,
      resumo.desconto > 0
        ? `Desconto (${resumo.percentualDesconto}%): -R$ ${resumo.desconto.toFixed(2)}`
        : null,
      `Taxa de serviço (5%): R$ ${resumo.taxaServico.toFixed(2)}`,
      `*Total final: R$ ${resumo.totalFinal.toFixed(2)}*`,
    ]
      .filter(Boolean)
      .join("%0A");

    return `https://wa.me/${telefone}?text=${linhas}`;
  }
}
