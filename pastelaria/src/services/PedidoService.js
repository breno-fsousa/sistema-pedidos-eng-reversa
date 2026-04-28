class PedidoService {
  constructor(pedido) {
    if (!(pedido instanceof Pedido)) {
      throw new Error("PedidoService requer uma instância de Pedido");
    }
    this.pedido = pedido;
    this.TAXA_SERVICO = 0.05;
  }

  adicionarItem(produtoId, quantidade) {
    const item = ItemPedidoFactory.criar(produtoId, quantidade);
    this.pedido.adicionarItem(item);
    return item;
  }

  removerUltimoItem() {
    this.pedido.removerUltimoItem();
  }

  calcularResumo() {
    const total = this.pedido.getTotal();
    const strategy = DescontoStrategySelector.selecionar(total);
    const desconto = strategy.calcular(total);
    const taxa = total * this.TAXA_SERVICO;
    const totalFinal = total - desconto + taxa;

    return {
      subtotal: total,
      desconto,
      descricaoDesconto: strategy.descricao(),
      taxaServico: taxa,
      totalFinal,
    };
  }

  finalizar() {
    const resumo = this.calcularResumo();
    this.pedido.finalizar();
    return resumo;
  }

  getItens() {
    return this.pedido.getItens();
  }

  getPedido() {
    return this.pedido;
  }

  limpar() {
    this.pedido.limpar();
  }

  gerarMensagemWhatsApp(resumo, telefone) {
    const itensTexto = this.pedido
      .getItens()
      .map(
        (i) =>
          `- ${i.produto.getNome()} x${i.quantidade} = R$ ${i
            .getSubtotal()
            .toFixed(2)}`
      )
      .join("%0A");

    const mensagem = [
      `*🍴 Pedido - Pastelaria do Zé*`,
      ``,
      itensTexto,
      ``,
      `Subtotal: R$ ${resumo.subtotal.toFixed(2)}`,
      resumo.desconto > 0
        ? `Desconto: -R$ ${resumo.desconto.toFixed(2)} (${resumo.descricaoDesconto})`
        : null,
      `Taxa de serviço: R$ ${resumo.taxaServico.toFixed(2)}`,
      `*Total final: R$ ${resumo.totalFinal.toFixed(2)}*`,
    ]
      .filter(Boolean)
      .join("%0A");

    return `https://wa.me/${telefone}?text=${mensagem}`;
  }
}
