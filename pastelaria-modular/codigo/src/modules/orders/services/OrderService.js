/**
 * MODULE: orders
 * LAYER: services
 * FILE: OrderService.js  (Padrão Service)
 *
 * Responsabilidade: Concentrar TODAS as regras de negócio do módulo de pedidos.
 *
 * O que faz:
 *   - Criar e gerenciar itens do pedido
 *   - Calcular subtotal, desconto (via PaymentService) e taxa de serviço
 *   - Finalizar pedido
 *   - Gerar mensagem de WhatsApp
 *
 * O que NÃO faz:
 *   - Não acessa DOM (responsabilidade da View)
 *   - Não persiste dados (responsabilidade do Repository)
 *   - Não emite eventos (responsabilidade do Controller)
 *
 * Comunicação entre módulos:
 *   OrderService usa ProductService para criar produtos.
 *   OrderService usa PaymentService para calcular descontos.
 *   Isso cria dependência entre módulos apenas nas camadas de Service,
 *   mantendo entities e repositories isolados.
 */
class OrderService {
  constructor(pedido) {
    if (!(pedido instanceof Pedido)) {
      throw new Error("OrderService: requer uma instância válida de Pedido");
    }
    this._pedido          = pedido;
    this._productService  = new ProductService();
    this._config          = new AppConfig();
    this._TAXA_SERVICO    = this._config.get("TAXA_SERVICO"); // 5%

    Logger.info("OrderService", "Serviço de pedido inicializado", { pedidoId: pedido.getId() });
  }

  // ---- Acesso ao modelo ----

  getPedido()  { return this._pedido; }
  getItens()   { return this._pedido.getItens(); }
  getTotal()   { return this._pedido.getTotal(); }
  temItens()   { return this._pedido.temItens(); }

  // ---- Manipulação de itens ----

  /**
   * Cria e adiciona um item ao pedido.
   * Usa ProductService para obter o produto (comunicação entre módulos).
   * @param {string}        produtoId
   * @param {number|string} quantidade
   * @returns {ItemPedido}
   */
  adicionarItem(produtoId, quantidade) {
    const qtd = parseInt(quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) {
      throw new Error("Quantidade inválida. Informe um número inteiro maior que zero.");
    }

    // Comunica com o módulo products via ProductService
    const produto = this._productService.criarProduto(produtoId);
    const item    = new ItemPedido(produto, qtd);

    this._pedido.adicionarItem(item);
    Logger.info("OrderService", `Item adicionado: ${produto.getNome()} x${qtd}`);
    return item;
  }

  removerUltimoItem() {
    this._pedido.removerUltimoItem();
    Logger.info("OrderService", "Último item removido");
  }

  limpar() {
    this._pedido.limpar();
    Logger.info("OrderService", "Pedido limpo");
  }

  // ---- Cálculo financeiro ----

  /**
   * Calcula o resumo financeiro completo do pedido.
   * Delega cálculo de desconto ao PaymentService (módulo payments).
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

    // Comunica com módulo payments para calcular desconto (Strategy)
    const desconto = PaymentService.calcularDesconto(subtotal);

    const taxaServico = subtotal * this._TAXA_SERVICO;
    const totalFinal  = subtotal - desconto.valor + taxaServico;

    return {
      subtotal,
      desconto:           desconto.valor,
      descricaoDesconto:  desconto.descricao,
      percentualDesconto: desconto.percentual,
      taxaServico,
      totalFinal,
    };
  }

  // ---- Ciclo de vida ----

  /**
   * Finaliza o pedido: calcula resumo e atualiza status da entidade.
   * @returns {object} resumo financeiro
   */
  finalizar() {
    const resumo = this.calcularResumo();
    this._pedido.finalizar();
    Logger.info("OrderService", "Pedido finalizado", {
      id:    this._pedido.getId(),
      total: resumo.totalFinal,
    });
    return resumo;
  }

  // ---- WhatsApp ----

  /**
   * Gera a URL wa.me com o resumo do pedido formatado.
   * @param {object} resumo   - retornado por calcularResumo()
   * @param {string} telefone - com DDI (ex: 5588999999999)
   * @returns {string}
   */
  gerarMensagemWhatsApp(resumo, telefone) {
    const linhasItens = this._pedido
      .getItens()
      .map(
        (i) =>
          `- ${i.getProduto().getNome()} x${i.getQuantidade()} = ${Formatters.moeda(i.getSubtotal())}`
      )
      .join("%0A");

    const linhas = [
      `*🍴 Pedido - Pastelaria do Zé*`,
      ``,
      linhasItens,
      ``,
      `Subtotal: ${Formatters.moeda(resumo.subtotal)}`,
      resumo.desconto > 0
        ? `Desconto (${resumo.percentualDesconto}%): -${Formatters.moeda(resumo.desconto)}`
        : null,
      `Taxa de serviço (5%): ${Formatters.moeda(resumo.taxaServico)}`,
      `*Total final: ${Formatters.moeda(resumo.totalFinal)}*`,
      ``,
      `Pedido gerado em: ${Formatters.dataHora(new Date().toISOString())}`,
    ]
      .filter(Boolean)
      .join("%0A");

    return `https://wa.me/${telefone}?text=${linhas}`;
  }
}
