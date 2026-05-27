/**
 * VIEW: PedidoView
 *
 * Responsabilidade: Única camada que acessa e manipula o DOM.
 * Na arquitetura modular, a View continua sendo uma camada transversal
 * que consome os controllers dos módulos e reage via EventBus.
 *
 * A View:
 *   ✔ Renderiza a interface do pedido
 *   ✔ Captura eventos do usuário e delega ao OrderController
 *   ✔ Reage passivamente aos eventos do EventBus (Observer)
 *   ✔ Exibe informações de autenticação via AuthController
 *   ✔ Exibe informações de pagamento via PaymentController
 *
 * A View NÃO:
 *   ✗ Calcula nada
 *   ✗ Conhece regras de negócio
 *   ✗ Acessa repositórios ou APIs diretamente
 */
class PedidoView {
  /**
   * @param {OrderController}   orderController
   * @param {AuthController}    authController
   */
  constructor(orderController, authController) {
    this._orderCtrl = orderController;
    this._authCtrl  = authController;
    this._bus       = new EventBus();

    // Elementos do DOM (obtidos uma única vez)
    this._el = {
      lista:          document.getElementById("lista"),
      total:          document.getElementById("total"),
      produto:        document.getElementById("produto"),
      qtd:            document.getElementById("qtd"),
      btnAdicionar:   document.getElementById("btn-adicionar"),
      btnFinalizar:   document.getElementById("btn-finalizar"),
      btnRemover:     document.getElementById("btn-remover"),
      btnLimpar:      document.getElementById("btn-limpar"),
      toast:          document.getElementById("toast"),
      modal:          document.getElementById("modal-finalizado"),
      modalBody:      document.getElementById("modal-body"),
      btnFecharModal: document.getElementById("btn-fechar-modal"),
      btnWhatsCliente:document.getElementById("btn-whats-cliente"),
      btnWhatsEstab:  document.getElementById("btn-whats-estab"),
      telCliente:     document.getElementById("tel-cliente"),
      telEstab:       document.getElementById("tel-estab"),
      // Auth
      loginOverlay:   document.getElementById("login-overlay"),
      loginForm:      document.getElementById("login-form"),
      inputLogin:     document.getElementById("input-login"),
      inputSenha:     document.getElementById("input-senha"),
      btnLogin:       document.getElementById("btn-login"),
      btnLogout:      document.getElementById("btn-logout"),
      usuarioInfo:    document.getElementById("usuario-info"),
      // Log panel
      logPanel:       document.getElementById("log-panel"),
      logLista:       document.getElementById("log-lista"),
      btnToggleLog:   document.getElementById("btn-toggle-log"),
    };

    this._bindEventosUI();
    this._registrarObservadores();
    this._verificarSessao();
  }

  // ================================================================
  // Binding de eventos de UI → Controllers
  // ================================================================

  _bindEventosUI() {
    this._el.btnAdicionar.addEventListener("click",  () => this._onAdicionar());
    this._el.btnFinalizar.addEventListener("click",  () => this._onFinalizar());
    this._el.btnRemover.addEventListener("click",    () => this._onRemoverUltimo());
    this._el.btnLimpar.addEventListener("click",     () => this._onLimpar());
    this._el.btnFecharModal.addEventListener("click",() => this._fecharModal());
    this._el.qtd.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this._onAdicionar();
    });

    // Auth
    if (this._el.btnLogin) {
      this._el.btnLogin.addEventListener("click", () => this._onLogin());
      this._el.inputSenha?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this._onLogin();
      });
    }
    if (this._el.btnLogout) {
      this._el.btnLogout.addEventListener("click", () => this._onLogout());
    }

    // Log panel
    if (this._el.btnToggleLog) {
      this._el.btnToggleLog.addEventListener("click", () => {
        this._el.logPanel?.classList.toggle("aberto");
      });
    }
  }

  // ---- Handlers de pedido ----

  _onAdicionar() {
    const produtoId  = this._el.produto.value;
    const quantidade = this._el.qtd.value;
    this._orderCtrl.adicionar(produtoId, quantidade);
    this._el.qtd.value = "";
    this._el.qtd.focus();
  }

  _onFinalizar() {
    const telCliente = this._el.telCliente?.value.trim() || "";
    const telEstab   = this._el.telEstab?.value.trim()   || "";
    this._orderCtrl.finalizar(telCliente, telEstab);
  }

  _onRemoverUltimo() {
    this._orderCtrl.removerUltimo();
  }

  _onLimpar() {
    if (confirm("Deseja limpar todos os itens do pedido?")) {
      this._orderCtrl.limpar();
    }
  }

  // ---- Handlers de auth ----

  _onLogin() {
    const login = this._el.inputLogin?.value.trim();
    const senha = this._el.inputSenha?.value.trim();
    if (!login || !senha) {
      this._exibirToast("Preencha usuário e senha.", "erro");
      return;
    }
    const ok = this._authCtrl.login(login, senha);
    if (ok) {
      this._fecharLoginOverlay();
      const usuario = this._authCtrl.getUsuarioAtual();
      this._atualizarInfoUsuario(usuario);
      this._exibirToast(`Bem-vindo, ${usuario?.getNome() || ""}!`, "info");
    }
  }

  _onLogout() {
    this._authCtrl.logout();
    this._atualizarInfoUsuario(null);
    this._abrirLoginOverlay();
    this._exibirToast("Sessão encerrada.", "info");
  }

  // ================================================================
  // Observadores do EventBus (Padrão Observer)
  // ================================================================

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

    this._bus.on(EVENTOS.USUARIO_LOGADO, (dados) => {
      Logger.info("PedidoView", "Usuário logado", dados);
    });

    // Logs centralizados — atualiza painel de log
    this._bus.on(EVENTOS.LOG, (entrada) => {
      this._adicionarLogUI(entrada);
    });

    // Pagamento aprovado — feedback visual
    this._bus.on(EVENTOS.PAGAMENTO_APROVADO, (dados) => {
      Logger.info("PedidoView", "Pagamento processado", dados);
    });
  }

  // ================================================================
  // Renderização
  // ================================================================

  _renderizarLista(itens, total) {
    this._el.lista.innerHTML = "";

    if (itens.length === 0) {
      this._el.lista.innerHTML = '<li class="vazio">Nenhum item adicionado</li>';
    } else {
      itens.forEach((item, idx) => {
        const li = document.createElement("li");
        li.style.animationDelay = `${idx * 50}ms`;
        li.innerHTML = `
          <span class="item-nome">${item.getProduto().getNome()}</span>
          <span class="item-qtd">x${item.getQuantidade()}</span>
          <span class="item-preco">${Formatters.moeda(item.getSubtotal())}</span>
        `;
        this._el.lista.appendChild(li);
      });
    }

    this._el.total.textContent = total.toFixed(2).replace(".", ",");
  }

  _abrirModal(dados) {
    const r = dados.resumo;

    this._el.modalBody.innerHTML = `
      <p><strong>Subtotal:</strong> ${Formatters.moeda(r.subtotal)}</p>
      ${r.desconto > 0
        ? `<p class="desconto">
            <strong>${r.descricaoDesconto}</strong><br>
            Desconto: <span>-${Formatters.moeda(r.desconto)}</span>
           </p>`
        : ""}
      <p><strong>Taxa de serviço (5%):</strong> ${Formatters.moeda(r.taxaServico)}</p>
      <hr>
      <p class="total-final"><strong>Total Final: ${Formatters.moeda(r.totalFinal)}</strong></p>
      <p class="data-pedido">Gerado em: ${Formatters.dataHora(new Date().toISOString())}</p>
    `;

    this._el.btnWhatsCliente.href = dados.urlClienteWhatsApp;
    this._el.btnWhatsEstab.href   = dados.urlEstabelecimentoWhatsApp;
    this._el.modal.classList.add("ativo");
  }

  _fecharModal() {
    this._el.modal.classList.remove("ativo");
  }

  _exibirToast(mensagem, tipo = "info") {
    this._el.toast.textContent = mensagem;
    this._el.toast.className   = `toast ${tipo} ativo`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this._el.toast.classList.remove("ativo");
    }, 3500);
  }

  // ================================================================
  // Auth UI
  // ================================================================

  _verificarSessao() {
    if (this._authCtrl.estaLogado()) {
      const usuario = this._authCtrl.getUsuarioAtual();
      this._fecharLoginOverlay();
      this._atualizarInfoUsuario(usuario);
    } else {
      this._abrirLoginOverlay();
    }
  }

  _abrirLoginOverlay() {
    this._el.loginOverlay?.classList.add("ativo");
  }

  _fecharLoginOverlay() {
    this._el.loginOverlay?.classList.remove("ativo");
  }

  _atualizarInfoUsuario(usuario) {
    if (!this._el.usuarioInfo) return;
    if (usuario) {
      this._el.usuarioInfo.innerHTML = `
        <span class="usuario-nome">👤 ${usuario.getNome?.() || usuario.nome}</span>
        <span class="usuario-papel">${usuario.getPapel?.() || usuario.papel}</span>
      `;
      this._el.btnLogout?.classList.remove("oculto");
    } else {
      this._el.usuarioInfo.innerHTML = "";
      this._el.btnLogout?.classList.add("oculto");
    }
  }

  // ================================================================
  // Log panel
  // ================================================================

  _adicionarLogUI(entrada) {
    if (!this._el.logLista) return;
    const item = document.createElement("div");
    item.className = `log-item log-${entrada.nivel.toLowerCase()}`;
    item.innerHTML = `
      <span class="log-nivel">${entrada.nivel}</span>
      <span class="log-modulo">${entrada.modulo}</span>
      <span class="log-msg">${entrada.mensagem}</span>
    `;
    this._el.logLista.prepend(item);

    // Mantém no máximo 30 entradas visíveis
    while (this._el.logLista.children.length > 30) {
      this._el.logLista.lastChild?.remove();
    }
  }
}
