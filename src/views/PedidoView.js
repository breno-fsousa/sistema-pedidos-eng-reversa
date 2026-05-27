/**
 * VIEW: PedidoView
 *
 * Responsabilidade: Única camada que acessa e manipula o DOM.
 * Reage a eventos do EventBus (padrão Observer) e delega
 * todas as ações do usuário ao Controller.
 *
 * A View:
 *   ✔ Renderiza a lista de itens e totais
 *   ✔ Exibe modal de finalização, toasts e erros
 *   ✔ Captura eventos do usuário (cliques, inputs)
 *   ✔ Delega tudo ao Controller — nunca decide por si só
 *
 * A View NÃO:
 *   ✗ Calcula totais, descontos ou taxas
 *   ✗ Acessa localStorage ou API
 *   ✗ Conhece modelos de domínio internamente
 *   ✗ Toma decisões de negócio
 *
 * Padrão Observer: a View se registra no EventBus
 * e reage passivamente às notificações do sistema.
 */
class PedidoView {
  /**
   * @param {PedidoController} controller
   */
  constructor(controller) {
    this._controller = controller;
    this._bus        = new EventBus();

    // Referências ao DOM (obtidas uma única vez no construtor)
    this._el = {
      lista:         document.getElementById("lista"),
      total:         document.getElementById("total"),
      produto:       document.getElementById("produto"),
      qtd:           document.getElementById("qtd"),
      btnAdicionar:  document.getElementById("btn-adicionar"),
      btnFinalizar:  document.getElementById("btn-finalizar"),
      btnRemover:    document.getElementById("btn-remover"),
      btnLimpar:     document.getElementById("btn-limpar"),
      toast:         document.getElementById("toast"),
      modal:         document.getElementById("modal-finalizado"),
      modalBody:     document.getElementById("modal-body"),
      btnFecharModal:document.getElementById("btn-fechar-modal"),
      btnWhatsCliente:   document.getElementById("btn-whats-cliente"),
      btnWhatsEstab:     document.getElementById("btn-whats-estab"),
      telCliente:    document.getElementById("tel-cliente"),
      telEstab:      document.getElementById("tel-estab"),
    };

    this._bindEventosUI();
    this._registrarObservadores();
  }

  // ================================================================
  // Binding de eventos de interface → Controller
  // ================================================================

  _bindEventosUI() {
    this._el.btnAdicionar.addEventListener("click",  () => this._onAdicionar());
    this._el.btnFinalizar.addEventListener("click",  () => this._onFinalizar());
    this._el.btnRemover.addEventListener("click",    () => this._onRemoverUltimo());
    this._el.btnLimpar.addEventListener("click",     () => this._onLimpar());
    this._el.btnFecharModal.addEventListener("click",() => this._fecharModal());

    // Atalho de teclado: Enter no campo de quantidade adiciona o item
    this._el.qtd.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this._onAdicionar();
    });
  }

  _onAdicionar() {
    const produtoId  = this._el.produto.value;
    const quantidade = this._el.qtd.value;
    this._controller.adicionar(produtoId, quantidade);
    this._el.qtd.value = "";
    this._el.qtd.focus();
  }

  _onFinalizar() {
    const telCliente = this._el.telCliente.value.trim() || "5500000000000";
    const telEstab   = this._el.telEstab.value.trim()   || "5500000000001";
    this._controller.finalizar(telCliente, telEstab);
  }

  _onRemoverUltimo() {
    this._controller.removerUltimo();
  }

  _onLimpar() {
    if (confirm("Deseja limpar todos os itens do pedido?")) {
      this._controller.limpar();
    }
  }

  // ================================================================
  // Observadores do EventBus (Padrão Observer)
  // ================================================================

  /**
   * Registra a View como observadora dos eventos relevantes do sistema.
   * A View reage passivamente — não puxa dados, aguarda notificações.
   */
  _registrarObservadores() {
    this._bus.on(EVENTOS.PEDIDO_ATUALIZADO, (dados) => {
      this._renderizarLista(dados.itens, dados.total);
    });

    this._bus.on(EVENTOS.PEDIDO_FINALIZADO, (dados) => {
      this._abrirModal(dados);
      this._renderizarLista([], 0);
    });

    this._bus.on(EVENTOS.PEDIDO_LIMPO, () => {
      this._renderizarLista([], 0);
      this._exibirToast("Pedido limpo com sucesso!", "info");
    });

    this._bus.on(EVENTOS.ERRO, (mensagem) => {
      this._exibirToast(mensagem, "erro");
    });
  }

  // ================================================================
  // Renderização
  // ================================================================

  /**
   * Atualiza a lista de itens exibida e o subtotal.
   * @param {ItemPedido[]} itens
   * @param {number}       total
   */
  _renderizarLista(itens, total) {
    this._el.lista.innerHTML = "";

    if (itens.length === 0) {
      this._el.lista.innerHTML =
        '<li class="vazio">Nenhum item adicionado</li>';
    } else {
      itens.forEach((item, idx) => {
        const li = document.createElement("li");
        li.style.animationDelay = `${idx * 50}ms`;
        li.innerHTML = `
          <span class="item-nome">${item.getProduto().getNome()}</span>
          <span class="item-qtd">x${item.getQuantidade()}</span>
          <span class="item-preco">R$ ${item.getSubtotal().toFixed(2)}</span>
        `;
        this._el.lista.appendChild(li);
      });
    }

    this._el.total.textContent = total.toFixed(2);
  }

  /**
   * Abre o modal de pedido finalizado com o resumo financeiro e links WhatsApp.
   * @param {{ resumo: object, urlClienteWhatsApp: string, urlEstabelecimentoWhatsApp: string }} dados
   */
  _abrirModal(dados) {
    const r = dados.resumo;

    this._el.modalBody.innerHTML = `
      <p><strong>Subtotal:</strong> R$ ${r.subtotal.toFixed(2)}</p>
      ${r.desconto > 0
        ? `<p class="desconto">
            <strong>${r.descricaoDesconto}</strong><br>
            Desconto: <span>-R$ ${r.desconto.toFixed(2)}</span>
           </p>`
        : ""}
      <p><strong>Taxa de serviço (5%):</strong> R$ ${r.taxaServico.toFixed(2)}</p>
      <hr>
      <p class="total-final"><strong>Total Final: R$ ${r.totalFinal.toFixed(2)}</strong></p>
    `;

    this._el.btnWhatsCliente.href = dados.urlClienteWhatsApp;
    this._el.btnWhatsEstab.href   = dados.urlEstabelecimentoWhatsApp;

    this._el.modal.classList.add("ativo");
  }

  _fecharModal() {
    this._el.modal.classList.remove("ativo");
  }

  /**
   * Exibe uma notificação temporária (toast) na tela.
   * @param {string} mensagem
   * @param {"info"|"erro"} tipo
   */
  _exibirToast(mensagem, tipo = "info") {
    this._el.toast.textContent = mensagem;
    this._el.toast.className   = `toast ${tipo} ativo`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this._el.toast.classList.remove("ativo");
    }, 3500);
  }
}
