class PedidoController {
  constructor() {
    this.pedido = PedidoFactory.criar();
    this.service = new PedidoService(this.pedido);
    this.repository = new PedidoRepository();
    this.bus = new EventBus();

    // Restaura pedido salvo localmente (se existir)
    this._restaurarPedidoLocal();
  }

  adicionar(produtoId, quantidade) {
    try {
      this.service.adicionarItem(produtoId, quantidade);
      this._persistirENotificar();
    } catch (e) {
      this.bus.emit(EVENTOS.ERRO, e.message);
    }
  }

  removerUltimo() {
    this.service.removerUltimoItem();
    this._persistirENotificar();
  }

  async finalizar(telefoneCliente, telefoneEstabelecimento) {
    if (this.pedido.getItens().length === 0) {
      this.bus.emit(EVENTOS.ERRO, "Nenhum item no pedido.");
      return;
    }

    const resumo = this.service.finalizar();

    this.repository.salvarUltimoPedido(resumo);
    await this.repository.salvarPedidoAPI(this.pedido);
    this.repository.limparLocal();

    this.bus.emit(EVENTOS.PEDIDO_FINALIZADO, {
      resumo,
      urlClienteWhatsApp: this.service.gerarMensagemWhatsApp(
        resumo,
        telefoneCliente || "5500000000000"
      ),
      urlEstabelecimentoWhatsApp: this.service.gerarMensagemWhatsApp(
        resumo,
        telefoneEstabelecimento || "5500000000001"
      ),
    });

    // Cria novo pedido limpo para próximo ciclo
    this.pedido = PedidoFactory.criar();
    this.service = new PedidoService(this.pedido);
  }

  limpar() {
    this.service.limpar();
    this.repository.limparLocal();
    this.bus.emit(EVENTOS.PEDIDO_LIMPO, null);
  }

  getItens() {
    return this.service.getItens();
  }

  getTotal() {
    return this.pedido.getTotal();
  }

  // ---------- privados ----------

  _persistirENotificar() {
    this.repository.salvarPedidoLocal(this.pedido);
    this.bus.emit(EVENTOS.PEDIDO_ATUALIZADO, {
      itens: this.pedido.getItens(),
      total: this.pedido.getTotal(),
    });
  }

  _restaurarPedidoLocal() {
    const salvo = this.repository.carregarPedidoLocal();
    if (!salvo || !salvo.itens || salvo.itens.length === 0) return;

    try {
      salvo.itens.forEach(({ produtoId, quantidade }) => {
        this.service.adicionarItem(produtoId, quantidade);
      });
      // Notifica a view após restauração
      this.bus.emit(EVENTOS.PEDIDO_ATUALIZADO, {
        itens: this.pedido.getItens(),
        total: this.pedido.getTotal(),
      });
    } catch (e) {
      console.warn("Não foi possível restaurar pedido:", e.message);
    }
  }
}
