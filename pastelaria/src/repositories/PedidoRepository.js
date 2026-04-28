class PedidoRepository {
  constructor() {
    // Singleton: impede segunda instância
    if (PedidoRepository._instancia) {
      return PedidoRepository._instancia;
    }
    this.API_URL = "http://localhost:3000/pedidos";
    PedidoRepository._instancia = this;
  }

  // ---------- localStorage ----------

  salvarPedidoLocal(pedido) {
    localStorage.setItem("pedidoAtual", JSON.stringify(pedido.toJSON()));
  }

  carregarPedidoLocal() {
    const raw = localStorage.getItem("pedidoAtual");
    return raw ? JSON.parse(raw) : null;
  }

  salvarUltimoPedido(resumo) {
    localStorage.setItem("ultimoPedido", JSON.stringify(resumo));
  }

  getUltimoPedido() {
    const raw = localStorage.getItem("ultimoPedido");
    return raw ? JSON.parse(raw) : null;
  }

  limparLocal() {
    localStorage.removeItem("pedidoAtual");
  }

  // ---------- JSON Server (API fake) ----------

  async salvarPedidoAPI(pedido) {
    try {
      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido.toJSON()),
      });
      if (!res.ok) throw new Error("Erro ao salvar no servidor");
      return await res.json();
    } catch (e) {
      // API offline é tolerável; apenas registra
      console.warn("API fake indisponível:", e.message);
      return null;
    }
  }

  async listarPedidos() {
    try {
      const res = await fetch(this.API_URL);
      return await res.json();
    } catch (e) {
      console.warn("API fake indisponível:", e.message);
      return [];
    }
  }
}

// Garante singleton mesmo em ambientes sem módulos
PedidoRepository._instancia = null;
