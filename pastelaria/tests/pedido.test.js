const resultados = [];

function it(descricao, fn) {
  try {
    fn();
    resultados.push({ ok: true, descricao });
  } catch (e) {
    resultados.push({ ok: false, descricao, erro: e.message });
  }
}

function assertEqual(a, b, msg) {
  if (a !== b) {
    throw new Error(
      msg || `Esperado "${b}", recebido "${a}"`
    );
  }
}

function assertApprox(a, b, msg, tolerancia = 0.01) {
  if (Math.abs(a - b) > tolerancia) {
    throw new Error(
      msg || `Esperado ≈${b}, recebido ${a}`
    );
  }
}

// ---------- Testes de Produto ----------

it("ProdutoFactory deve criar produto válido", () => {
  const p = ProdutoFactory.criar("pastel");
  assertEqual(p.getNome(), "Pastel");
  assertEqual(p.getPreco(), 5);
});

it("ProdutoFactory deve lançar erro para produto inexistente", () => {
  let lancou = false;
  try {
    ProdutoFactory.criar("xxxx");
  } catch {
    lancou = true;
  }
  assertEqual(lancou, true, "Deveria ter lançado erro");
});

// ---------- Testes de ItemPedido ----------

it("ItemPedido deve calcular subtotal corretamente", () => {
  const item = ItemPedidoFactory.criar("caldo", 3);
  assertApprox(item.getSubtotal(), 21, "Caldo R$7 x 3 = R$21");
});

it("ItemPedidoFactory deve rejeitar quantidade zero", () => {
  let lancou = false;
  try { ItemPedidoFactory.criar("pastel", 0); } catch { lancou = true; }
  assertEqual(lancou, true, "Deveria rejeitar qtd 0");
});

it("ItemPedidoFactory deve rejeitar quantidade negativa", () => {
  let lancou = false;
  try { ItemPedidoFactory.criar("pastel", -1); } catch { lancou = true; }
  assertEqual(lancou, true, "Deveria rejeitar qtd negativa");
});

// ---------- Testes de Pedido ----------

it("Pedido vazio deve ter total 0", () => {
  const pedido = PedidoFactory.criar();
  assertEqual(pedido.getTotal(), 0);
});

it("Pedido deve somar itens corretamente", () => {
  const pedido = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  service.adicionarItem("pastel", 2);       // 10
  service.adicionarItem("refrigerante", 1); // 4
  assertApprox(pedido.getTotal(), 14);
});

// ---------- Testes de Desconto ----------

it("Sem desconto para total <= 50", () => {
  const strategy = DescontoStrategySelector.selecionar(30);
  assertEqual(strategy.calcular(30), 0);
});

it("Desconto 10% para total entre 50 e 100", () => {
  const strategy = DescontoStrategySelector.selecionar(60);
  assertApprox(strategy.calcular(60), 6);
});

it("Desconto 20% para total acima de 100", () => {
  const strategy = DescontoStrategySelector.selecionar(120);
  assertApprox(strategy.calcular(120), 24);
});

// ---------- Testes do cálculo completo (taxa + desconto) ----------

it("Resumo com total 60 deve ter desconto 10% e taxa 5%", () => {
  const pedido = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  // caldo R$7 x 2 = 14, suco R$6 x 4 = 24, pastel R$5 x 4 = 20 → total = 58... ajustamos
  // suco R$6 x 10 = 60
  service.adicionarItem("suco", 10);
  const resumo = service.calcularResumo();
  assertApprox(resumo.subtotal,    60,   "Subtotal deve ser 60");
  assertApprox(resumo.desconto,     6,   "Desconto 10% = 6");
  assertApprox(resumo.taxaServico,  3,   "Taxa 5% = 3");
  assertApprox(resumo.totalFinal,  57,   "Total final = 57");
});

it("Singleton PedidoRepository retorna mesma instância", () => {
  const r1 = new PedidoRepository();
  const r2 = new PedidoRepository();
  assertEqual(r1 === r2, true, "Devem ser a mesma instância");
});

it("Singleton EventBus retorna mesma instância", () => {
  const e1 = new EventBus();
  const e2 = new EventBus();
  assertEqual(e1 === e2, true, "Devem ser a mesma instância");
});

// ---------- Exibir resultados ----------

function exibirResultados() {
  const total  = resultados.length;
  const passed = resultados.filter((r) => r.ok).length;
  const failed = total - passed;

  // Ambiente Node
  if (typeof process !== "undefined") {
    console.log(`\n📋 Resultados: ${passed}/${total} passaram\n`);
    resultados.forEach((r) => {
      const icon = r.ok ? "✅" : "❌";
      console.log(`${icon} ${r.descricao}${r.erro ? " — " + r.erro : ""}`);
    });
    if (failed > 0) process.exit(1);
  }

  // Ambiente Browser
  return { total, passed, failed, resultados };
}

const relatorio = exibirResultados();
