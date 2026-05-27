/**
 * TESTES UNITÁRIOS — Pastelaria do Zé (MVC)
 *
 * Testa as camadas de Model, Factory, Service e Repository
 * de forma isolada, sem dependência de DOM ou UI.
 *
 * Compatível com: navegador (runner.html) e Node.js
 */

const resultados = [];

// ---- Utilitários de teste ----

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
    throw new Error(msg || `Esperado "${b}", recebido "${a}"`);
  }
}

function assertApprox(a, b, msg, tolerancia = 0.01) {
  if (Math.abs(a - b) > tolerancia) {
    throw new Error(msg || `Esperado ≈${b}, recebido ${a}`);
  }
}

function assertThrows(fn, msg) {
  let lancou = false;
  try { fn(); } catch { lancou = true; }
  if (!lancou) throw new Error(msg || "Deveria ter lançado um erro");
}

// ================================================================
// TESTES DE MODEL: Produto
// ================================================================

it("[Produto] deve criar produto com dados corretos", () => {
  const p = new Produto("pastel", "Pastel", 5);
  assertEqual(p.getId(),    "pastel");
  assertEqual(p.getNome(),  "Pastel");
  assertEqual(p.getPreco(), 5);
});

it("[Produto] deve rejeitar preço negativo", () => {
  assertThrows(() => new Produto("x", "X", -1), "Deve rejeitar preço negativo");
});

it("[Produto] deve rejeitar preço zero", () => {
  assertThrows(() => new Produto("x", "X", 0), "Deve rejeitar preço zero");
});

// ================================================================
// TESTES DE FACTORY: ProdutoFactory
// ================================================================

it("[ProdutoFactory] deve criar Pastel corretamente", () => {
  const p = ProdutoFactory.criar("pastel");
  assertEqual(p.getNome(),  "Pastel");
  assertEqual(p.getPreco(), 5);
});

it("[ProdutoFactory] deve criar Caldo corretamente", () => {
  const p = ProdutoFactory.criar("caldo");
  assertEqual(p.getNome(),  "Caldo");
  assertEqual(p.getPreco(), 7);
});

it("[ProdutoFactory] deve lançar erro para produto inexistente", () => {
  assertThrows(() => ProdutoFactory.criar("xxxx"), "Produto inexistente deve lançar erro");
});

it("[ProdutoFactory] listarTodos deve retornar 4 produtos", () => {
  const lista = ProdutoFactory.listarTodos();
  assertEqual(lista.length, 4, "Catálogo deve ter 4 produtos");
});

// ================================================================
// TESTES DE MODEL: ItemPedido
// ================================================================

it("[ItemPedido] deve calcular subtotal corretamente (Caldo x3 = R$21)", () => {
  const item = ItemPedidoFactory.criar("caldo", 3);
  assertApprox(item.getSubtotal(), 21);
});

it("[ItemPedido] deve calcular subtotal de Pastel x2 = R$10", () => {
  const item = ItemPedidoFactory.criar("pastel", 2);
  assertApprox(item.getSubtotal(), 10);
});

it("[ItemPedidoFactory] deve rejeitar quantidade zero", () => {
  assertThrows(() => ItemPedidoFactory.criar("pastel", 0));
});

it("[ItemPedidoFactory] deve rejeitar quantidade negativa", () => {
  assertThrows(() => ItemPedidoFactory.criar("pastel", -1));
});

it("[ItemPedidoFactory] deve rejeitar quantidade não numérica", () => {
  assertThrows(() => ItemPedidoFactory.criar("pastel", "abc"));
});

// ================================================================
// TESTES DE MODEL: Pedido
// ================================================================

it("[Pedido] deve iniciar com total zero e status aberto", () => {
  const pedido = PedidoFactory.criar();
  assertEqual(pedido.getTotal(),  0);
  assertEqual(pedido.getStatus(), "aberto");
});

it("[Pedido] deve somar itens corretamente", () => {
  const pedido  = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  service.adicionarItem("pastel", 2);       // R$10
  service.adicionarItem("refrigerante", 1); // R$4
  assertApprox(pedido.getTotal(), 14);
});

it("[Pedido] removerUltimoItem deve reduzir o total", () => {
  const pedido  = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  service.adicionarItem("pastel", 2);       // R$10
  service.adicionarItem("caldo", 1);        // R$7  → total R$17
  service.removerUltimoItem();              //        → total R$10
  assertApprox(pedido.getTotal(), 10);
});

it("[Pedido] limpar deve zerar os itens", () => {
  const pedido  = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  service.adicionarItem("suco", 5);
  service.limpar();
  assertEqual(pedido.getTotal(), 0);
  assertEqual(pedido.temItens(), false);
});

it("[Pedido] finalizar deve mudar status para finalizado", () => {
  const pedido  = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  service.adicionarItem("pastel", 1);
  service.finalizar();
  assertEqual(pedido.getStatus(), "finalizado");
});

it("[Pedido] não deve permitir finalizar sem itens", () => {
  const pedido  = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  assertThrows(() => service.finalizar(), "Não deve finalizar pedido vazio");
});

// ================================================================
// TESTES DE SERVICE: DescontoService (Strategy)
// ================================================================

it("[DescontoService] sem desconto para total <= R$50", () => {
  const d = DescontoService.calcular(30);
  assertEqual(d.valor,      0);
  assertEqual(d.percentual, 0);
});

it("[DescontoService] desconto de 10% para total entre R$50 e R$100", () => {
  const d = DescontoService.calcular(60);
  assertApprox(d.valor, 6);
  assertEqual(d.percentual, 10);
});

it("[DescontoService] desconto de 20% para total acima de R$100", () => {
  const d = DescontoService.calcular(120);
  assertApprox(d.valor, 24);
  assertEqual(d.percentual, 20);
});

it("[DescontoService] fronteira: R$50 exato não tem desconto", () => {
  const d = DescontoService.calcular(50);
  assertEqual(d.valor, 0);
});

it("[DescontoService] fronteira: R$100 exato tem 10% (não 20%)", () => {
  const d = DescontoService.calcular(100);
  assertApprox(d.valor, 10);
  assertEqual(d.percentual, 10);
});

// ================================================================
// TESTES DE SERVICE: PedidoService (cálculo completo)
// ================================================================

it("[PedidoService] resumo correto para total R$60 (10% desc + 5% taxa)", () => {
  const pedido  = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  service.adicionarItem("suco", 10); // R$6 x10 = R$60

  const resumo = service.calcularResumo();
  assertApprox(resumo.subtotal,   60,  "Subtotal deve ser 60");
  assertApprox(resumo.desconto,    6,  "Desconto 10% = 6");
  assertApprox(resumo.taxaServico, 3,  "Taxa 5% = 3");
  assertApprox(resumo.totalFinal, 57,  "Total final = 57");
});

it("[PedidoService] resumo correto para total R$120 (20% desc + 5% taxa)", () => {
  const pedido  = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  service.adicionarItem("caldo", 17); // R$7 x17 = R$119... ajuste:
  // R$6 x 20 = R$120
  const pedido2  = PedidoFactory.criar();
  const service2 = new PedidoService(pedido2);
  service2.adicionarItem("suco", 20); // R$120

  const resumo = service2.calcularResumo();
  assertApprox(resumo.subtotal,    120, "Subtotal deve ser 120");
  assertApprox(resumo.desconto,     24, "Desconto 20% = 24");
  assertApprox(resumo.taxaServico,   6, "Taxa 5% = 6");
  assertApprox(resumo.totalFinal,  102, "Total final = 102");
});

it("[PedidoService] resumo correto para total R$30 (sem desc + 5% taxa)", () => {
  const pedido  = PedidoFactory.criar();
  const service = new PedidoService(pedido);
  service.adicionarItem("pastel", 6); // R$5 x6 = R$30

  const resumo = service.calcularResumo();
  assertApprox(resumo.subtotal,    30,   "Subtotal deve ser 30");
  assertApprox(resumo.desconto,     0,   "Sem desconto");
  assertApprox(resumo.taxaServico,  1.5, "Taxa 5% = 1.5");
  assertApprox(resumo.totalFinal,  31.5, "Total final = 31.5");
});

// ================================================================
// TESTES DE SINGLETON: PedidoRepository e EventBus
// ================================================================

it("[Singleton] PedidoRepository retorna a mesma instância", () => {
  const r1 = new PedidoRepository();
  const r2 = new PedidoRepository();
  assertEqual(r1 === r2, true, "Devem ser a mesma instância (Singleton)");
});

it("[Singleton] EventBus retorna a mesma instância", () => {
  const e1 = new EventBus();
  const e2 = new EventBus();
  assertEqual(e1 === e2, true, "Devem ser a mesma instância (Singleton)");
});

// ================================================================
// TESTES DE OBSERVER: EventBus
// ================================================================

it("[EventBus] deve chamar callback ao emitir evento", () => {
  const bus = new EventBus();
  let chamado = false;
  const handler = () => { chamado = true; };

  bus.on("teste:evento", handler);
  bus.emit("teste:evento", {});
  bus.off("teste:evento", handler); // limpeza

  assertEqual(chamado, true, "Callback deve ter sido chamado");
});

it("[EventBus] deve passar dados corretamente ao callback", () => {
  const bus = new EventBus();
  let recebido = null;
  const handler = (d) => { recebido = d; };

  bus.on("teste:dados", handler);
  bus.emit("teste:dados", { valor: 42 });
  bus.off("teste:dados", handler);

  assertEqual(recebido.valor, 42, "Deve receber os dados corretos");
});

it("[EventBus] off deve remover o listener corretamente", () => {
  const bus = new EventBus();
  let contador = 0;
  const handler = () => { contador++; };

  bus.on("teste:off", handler);
  bus.emit("teste:off", {});   // contador = 1
  bus.off("teste:off", handler);
  bus.emit("teste:off", {});   // não deve incrementar

  assertEqual(contador, 1, "Após off, não deve mais receber eventos");
});

// ================================================================
// EXIBIÇÃO DOS RESULTADOS
// ================================================================

function exibirResultados() {
  const total  = resultados.length;
  const passed = resultados.filter((r) => r.ok).length;
  const failed = total - passed;

  // Ambiente Node.js
  if (typeof process !== "undefined") {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`  🧪 PASTELARIA DO ZÉ — Testes Unitários (MVC)`);
    console.log(`${"=".repeat(50)}`);
    resultados.forEach((r) => {
      const icon = r.ok ? "✅" : "❌";
      console.log(`${icon}  ${r.descricao}${r.erro ? "\n     ↳ " + r.erro : ""}`);
    });
    console.log(`${"=".repeat(50)}`);
    console.log(`  Resultado: ${passed}/${total} passaram ${failed > 0 ? `(${failed} falhas)` : "🎉"}`);
    console.log(`${"=".repeat(50)}\n`);
    if (failed > 0) process.exit(1);
  }

  return { total, passed, failed, resultados };
}

const relatorio = exibirResultados();
