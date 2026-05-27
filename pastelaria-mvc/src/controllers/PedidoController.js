/**
 * CONTROLLER: PedidoController
 *
 * Responsabilidade: Intermediário entre a View e as camadas de negócio/dados.
 * Recebe eventos da View, aciona Services e Repository, e notifica a View
 * através do EventBus (padrão Observer) — sem nunca tocar o DOM diretamente.
 *
 * O Controller:
 *   ✔ Recebe ações do usuário (via chamadas da View)
 *   ✔ Coordena o fluxo: Service → Repository → EventBus
 *   ✔ Trata erros e os propaga via eventos
 *   ✔ Restaura estado persistido ao inicializar
 *
 * O Controller NÃO:
 *   ✗ Contém regras de negócio complexas (responsabilidade do Service)
 *   ✗ Acessa dados diretamente (responsabilidade do Repository)
 *   ✗ Manipula o DOM (responsabilidade da View)
 *   ✗ Conhece componentes visuais específicos
 *
 * Fluxo MVC:
 *   View → Controller → Service → Repository → Model
 *                    ↓
 *               EventBus → View (Observer)
 */
class PedidoController {
  constructor() {
    // Cria as dependências (composição)
    this._pedido     = PedidoFactory.criar();
    this._service    = new PedidoService(this._pedido);
    this._repository = new PedidoRepository();
    this._bus        = new EventBus();

    // Restaura pedido salvo anteriormente (recuperação de sessão)
    this._restaurarSessao();
  }

  // ================================================================
  // Ações expostas à View
  // ================================================================

  /**
   * Adiciona um item ao pedido atual.
   * @param {string}        produtoId
   * @param {number|string} quantidade
   */
  adicionar(produtoId, quantidade) {
    try {
      this._service.adicionarItem(produtoId, quantidade);
      this._persistirENotificar();
    } catch (e) {
      this._bus.emit(EVENTOS.ERRO, e.message);
    }
  }

  /**
   * Remove o último item adicionado.
   */
  removerUltimo() {
    try {
      this._service.removerUltimoItem();
      this._persistirENotificar();
    } catch (e) {
      this._bus.emit(EVENTOS.ERRO, e.message);
    }
  }

  /**
   * Finaliza o pedido atual:
   *  1. Valida via Service
   *  2. Persiste localmente e na API
   *  3. Emite evento de finalização com resumo e links WhatsApp
   *  4. Reinicia o ciclo com um novo pedido limpo
   *
   * @param {string} telefoneCliente
   * @param {string} telefoneEstabelecimento
   */
  async finalizar(telefoneCliente, telefoneEstabelecimento) {
    try {
      // Valida e calcula (regra de negócio no Service)
      const resumo = this._service.finalizar();

      // Persiste o resumo e envia à API (Repository)
      this._repository.salvarUltimoPedido(resumo);
      await this._repository.salvarPedidoAPI(this._pedido);
      this._repository.limparLocal();

      // Gera links WhatsApp (regra de negócio no Service)
      const urlCliente = this._service.gerarMensagemWhatsApp(
        resumo,
        telefoneCliente || "5500000000000"
      );
      const urlEstabelecimento = this._service.gerarMensagemWhatsApp(
        resumo,
        telefoneEstabelecimento || "5500000000001"
      );

      // Notifica a View via Observer
      this._bus.emit(EVENTOS.PEDIDO_FINALIZADO, {
        resumo,
        urlClienteWhatsApp:        urlCliente,
        urlEstabelecimentoWhatsApp: urlEstabelecimento,
      });

      // Reinicia para o próximo pedido
      this._pedido  = PedidoFactory.criar();
      this._service = new PedidoService(this._pedido);

    } catch (e) {
      this._bus.emit(EVENTOS.ERRO, e.message);
    }
  }

  /**
   * Limpa todos os itens e reinicia o pedido.
   */
  limpar() {
    try {
      this._service.limpar();
      this._repository.limparLocal();
      this._bus.emit(EVENTOS.PEDIDO_LIMPO, null);
    } catch (e) {
      this._bus.emit(EVENTOS.ERRO, e.message);
    }
  }

  // ================================================================
  // Consultas (leitura de estado) — sem efeito colateral
  // ================================================================

  getItens() {
    return this._service.getItens();
  }

  getTotal() {
    return this._service.getTotal();
  }

  getResumo() {
    return this._service.calcularResumo();
  }

  // ================================================================
  // Métodos privados
  // ================================================================

  /**
   * Salva o estado atual no localStorage e notifica a View.
   * Chamado após qualquer alteração no pedido.
   */
  _persistirENotificar() {
    this._repository.salvarPedidoLocal(this._pedido);
    this._bus.emit(EVENTOS.PEDIDO_ATUALIZADO, {
      itens: this._pedido.getItens(),
      total: this._pedido.getTotal(),
    });
  }

  /**
   * Tenta restaurar o pedido em andamento da sessão anterior.
   * Se não houver dados válidos, ignora silenciosamente.
   * Chamado apenas no construtor.
   */
  _restaurarSessao() {
    const salvo = this._repository.carregarPedidoLocal();
    if (!salvo || !Array.isArray(salvo.itens) || salvo.itens.length === 0) return;

    try {
      salvo.itens.forEach(({ produtoId, quantidade }) => {
        this._service.adicionarItem(produtoId, quantidade);
      });

      // Notifica a View que há dados restaurados
      this._bus.emit(EVENTOS.PEDIDO_ATUALIZADO, {
        itens: this._pedido.getItens(),
        total: this._pedido.getTotal(),
      });
    } catch (e) {
      console.warn("PedidoController: não foi possível restaurar a sessão:", e.message);
      this._repository.limparLocal();
    }
  }
}
