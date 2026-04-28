class PedidoView {
  constructor(controller) {
    this.controller = controller;
    this.bus = new EventBus();

    // Referências ao DOM
    this.$lista        = document.getElementById("lista");
    this.$total        = document.getElementById("total");
    this.$produto      = document.getElementById("produto");
    this.$qtd          = document.getElementById("qtd");
    this.$btnAdicionar = document.getElementById("btn-adicionar");
    this.$btnFinalizar = document.getElementById("btn-finalizar");
    this.$btnRemover   = document.getElementById("btn-remover");
    this.$btnLimpar    = document.getElementById("btn-limpar");
    this.$toast        = document.getElementById("toast");
    this.$modal        = document.getElementById("modal-finalizado");
    this.$modalBody    = document.getElementById("modal-body");
    this.$btnFecharModal = document.getElementById("btn-fechar-modal");
    this.$btnWhatsCliente = document.getElementById("btn-whats-cliente");
    this.$btnWhatsEstab   = document.getElementById("btn-whats-estab");

    this._bindEventos();
    this._ouvirEventBus();
  }

  // ---------- Binding de eventos de UI ----------

  _bindEventos() {
    this.$btnAdicionar.addEventListener("click", () => this._onAdicionar());
    this.$btnFinalizar.addEventListener("click", () => this._onFinalizar());
    this.$btnRemover.addEventListener("click",   () => this._onRemoverUltimo());
    this.$btnLimpar.addEventListener("click",    () => this._onLimpar());
    this.$btnFecharModal.addEventListener("click",() => this._fecharModal());
  }

  _onAdicionar() {
    const produtoId  = this.$produto.value;
    const quantidade = this.$qtd.value;
    this.controller.adicionar(produtoId, quantidade);
    this.$qtd.value = "";
  }

  _onFinalizar() {
    const telCliente = document.getElementById("tel-cliente").value.trim() || "5500000000000";
    const telEstab   = document.getElementById("tel-estab").value.trim()   || "5500000000001";
    this.controller.finalizar(telCliente, telEstab);
  }

  _onRemoverUltimo() {
    this.controller.removerUltimo();
  }

  _onLimpar() {
    if (confirm("Deseja limpar todos os itens?")) {
      this.controller.limpar();
    }
  }

  // ---------- Reação ao EventBus (Observer) ----------

  _ouvirEventBus() {
    this.bus.on(EVENTOS.PEDIDO_ATUALIZADO, (dados) => {
      this._renderizarLista(dados.itens, dados.total);
    });

    this.bus.on(EVENTOS.PEDIDO_FINALIZADO, (dados) => {
      this._abrirModal(dados);
      this._renderizarLista([], 0);
    });

    this.bus.on(EVENTOS.PEDIDO_LIMPO, () => {
      this._renderizarLista([], 0);
      this._showToast("Pedido limpo!", "info");
    });

    this.bus.on(EVENTOS.ERRO, (msg) => {
      this._showToast(msg, "erro");
    });
  }

  // ---------- Renderização ----------

  _renderizarLista(itens, total) {
    this.$lista.innerHTML = "";

    if (itens.length === 0) {
      this.$lista.innerHTML =
        '<li class="vazio">Nenhum item adicionado</li>';
    } else {
      itens.forEach((item, idx) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="item-nome">${item.produto.getNome()}</span>
          <span class="item-qtd">x${item.quantidade}</span>
          <span class="item-preco">R$ ${item.getSubtotal().toFixed(2)}</span>
        `;
        li.style.animationDelay = `${idx * 50}ms`;
        this.$lista.appendChild(li);
      });
    }

    this.$total.textContent = total.toFixed(2);
  }

  _abrirModal(dados) {
    const r = dados.resumo;
    this.$modalBody.innerHTML = `
      <p><strong>Subtotal:</strong> R$ ${r.subtotal.toFixed(2)}</p>
      ${r.desconto > 0
        ? `<p class="desconto"><strong>${r.descricaoDesconto}</strong><br>
           Desconto: -R$ ${r.desconto.toFixed(2)}</p>`
        : ""}
      <p><strong>Taxa de serviço (5%):</strong> R$ ${r.taxaServico.toFixed(2)}</p>
      <p class="total-final"><strong>Total Final: R$ ${r.totalFinal.toFixed(2)}</strong></p>
    `;
    this.$btnWhatsCliente.href = dados.urlClienteWhatsApp;
    this.$btnWhatsEstab.href   = dados.urlEstabelecimentoWhatsApp;
    this.$modal.classList.add("ativo");
  }

  _fecharModal() {
    this.$modal.classList.remove("ativo");
  }

  _showToast(msg, tipo = "info") {
    this.$toast.textContent = msg;
    this.$toast.className = `toast ${tipo} ativo`;
    setTimeout(() => this.$toast.classList.remove("ativo"), 3000);
  }
}
