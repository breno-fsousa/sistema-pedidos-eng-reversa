/**
 * TESTES UNITÁRIOS — Pastelaria do Zé (Arquitetura Modular)
 *
 * Cobre todos os módulos: auth, products, orders, payments e shared.
 * Compatível com navegador (runner.html) e Node.js (npm test).
 */

const resultados = [];

// ---- Utilitários ----
function it(descricao, fn) {
  try { fn(); resultados.push({ ok: true, descricao }); }
  catch (e) { resultados.push({ ok: false, descricao, erro: e.message }); }
}
function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Esperado "${b}", recebido "${a}"`);
}
function assertApprox(a, b, msg, tol = 0.01) {
  if (Math.abs(a - b) > tol) throw new Error(msg || `Esperado ≈${b}, recebido ${a}`);
}
function assertThrows(fn, msg) {
  let lancou = false;
  try { fn(); } catch { lancou = true; }
  if (!lancou) throw new Error(msg || "Deveria ter lançado erro");
}
function assertTrue(cond, msg) {
  if (!cond) throw new Error(msg || "Condição falsa");
}

// ================================================================
// SHARED — AppConfig (Singleton)
// ================================================================

it("[AppConfig] deve retornar a mesma instância (Singleton)", () => {
  const c1 = new AppConfig();
  const c2 = new AppConfig();
  assertEqual(c1 === c2, true);
});

it("[AppConfig] deve retornar taxa de serviço 5%", () => {
  const c = new AppConfig();
  assertApprox(c.get("TAXA_SERVICO"), 0.05);
});

it("[AppConfig] deve retornar limites de desconto corretos", () => {
  const c = new AppConfig();
  assertEqual(c.get("LIMITE_DESCONTO_MEDIO"), 50);
  assertEqual(c.get("LIMITE_DESCONTO_ALTO"),  100);
});

it("[AppConfig] deve avisar para chave desconhecida sem lançar erro", () => {
  const c = new AppConfig();
  const val = c.get("CHAVE_INEXISTENTE");
  assertEqual(val, undefined);
});

// ================================================================
// SHARED — Formatters
// ================================================================

it("[Formatters] moeda deve formatar corretamente", () => {
  assertEqual(Formatters.moeda(10),    "R$ 10,00");
  assertEqual(Formatters.moeda(57.5),  "R$ 57,50");
  assertEqual(Formatters.moeda(0.1+0.2), "R$ 0,30"); // ponto flutuante
});

it("[Formatters] gerarId deve produzir strings únicas", () => {
  const id1 = Formatters.gerarId();
  const id2 = Formatters.gerarId();
  assertTrue(id1 !== id2, "IDs devem ser únicos");
});

it("[Formatters] truncar deve limitar texto longo", () => {
  const longo = "a".repeat(50);
  const curto = Formatters.truncar(longo, 40);
  assertTrue(curto.length <= 41, "Texto truncado deve ter no máximo limite+1 (…)");
});

// ================================================================
// SHARED — EventBus (Singleton + Observer)
// ================================================================

it("[EventBus] deve retornar a mesma instância (Singleton)", () => {
  const e1 = new EventBus();
  const e2 = new EventBus();
  assertEqual(e1 === e2, true);
});

it("[EventBus] deve chamar callback ao emitir evento", () => {
  const bus = new EventBus();
  let chamado = false;
  const handler = () => { chamado = true; };
  bus.on("test:evt1", handler);
  bus.emit("test:evt1", {});
  bus.off("test:evt1", handler);
  assertEqual(chamado, true);
});

it("[EventBus] deve passar dados corretos ao callback", () => {
  const bus = new EventBus();
  let recebido = null;
  const handler = (d) => { recebido = d; };
  bus.on("test:dados", handler);
  bus.emit("test:dados", { valor: 99 });
  bus.off("test:dados", handler);
  assertEqual(recebido.valor, 99);
});

it("[EventBus] off deve remover listener", () => {
  const bus = new EventBus();
  let count = 0;
  const handler = () => count++;
  bus.on("test:off", handler);
  bus.emit("test:off", {});
  bus.off("test:off", handler);
  bus.emit("test:off", {});
  assertEqual(count, 1, "Deve ter chamado apenas uma vez");
});

// ================================================================
// MODULE: products — Produto (Entidade)
// ================================================================

it("[Produto] deve criar com atributos corretos", () => {
  const p = new Produto("pastel", "Pastel", 5, "salgado");
  assertEqual(p.getId(),        "pastel");
  assertEqual(p.getNome(),      "Pastel");
  assertEqual(p.getPreco(),     5);
  assertEqual(p.getCategoria(), "salgado");
});

it("[Produto] deve rejeitar id vazio", () => {
  assertThrows(() => new Produto("", "Pastel", 5));
});

it("[Produto] deve rejeitar preco zero", () => {
  assertThrows(() => new Produto("x", "X", 0));
});

it("[Produto] deve rejeitar preco negativo", () => {
  assertThrows(() => new Produto("x", "X", -1));
});

// ================================================================
// MODULE: products — ProductRepository
// ================================================================

it("[ProductRepository] deve retornar a mesma instância (Singleton)", () => {
  const r1 = new ProductRepository();
  const r2 = new ProductRepository();
  assertEqual(r1 === r2, true);
});

it("[ProductRepository] listarTodos deve retornar 4 produtos", () => {
  const repo = new ProductRepository();
  assertEqual(repo.listarTodos().length, 4);
});

it("[ProductRepository] buscarPorId deve retornar Pastel", () => {
  const repo = new ProductRepository();
  const p = repo.buscarPorId("pastel");
  assertEqual(p.getNome(),  "Pastel");
  assertEqual(p.getPreco(), 5);
});

it("[ProductRepository] buscarPorId deve lançar erro para id inválido", () => {
  const repo = new ProductRepository();
  assertThrows(() => repo.buscarPorId("xxxxx"));
});

it("[ProductRepository] existe deve retornar false para produto inexistente", () => {
  const repo = new ProductRepository();
  assertEqual(repo.existe("naoexiste"), false);
});

// ================================================================
// MODULE: products — ProductService
// ================================================================

it("[ProductService] criarProduto deve retornar instância de Produto", () => {
  const svc = new ProductService();
  const p = svc.criarProduto("caldo");
  assertTrue(p instanceof Produto);
  assertEqual(p.getNome(), "Caldo");
  assertEqual(p.getPreco(), 7);
});

it("[ProductService] listarPorCategoria deve agrupar corretamente", () => {
  const svc = new ProductService();
  const grupos = svc.listarPorCategoria();
  assertTrue("salgado" in grupos, "Deve ter categoria salgado");
  assertTrue("bebida"  in grupos, "Deve ter categoria bebida");
  assertEqual(grupos.salgado.length, 2);
  assertEqual(grupos.bebida.length,  2);
});

// ================================================================
// MODULE: orders — ItemPedido (Entidade)
// ================================================================

it("[ItemPedido] deve calcular subtotal Caldo x3 = R$21", () => {
  const prod = new Produto("caldo", "Caldo", 7, "salgado");
  const item = new ItemPedido(prod, 3);
  assertApprox(item.getSubtotal(), 21);
});

it("[ItemPedido] deve rejeitar quantidade negativa", () => {
  const prod = new Produto("pastel", "Pastel", 5, "salgado");
  assertThrows(() => new ItemPedido(prod, -1));
});

it("[ItemPedido] deve rejeitar quantidade zero", () => {
  const prod = new Produto("pastel", "Pastel", 5, "salgado");
  assertThrows(() => new ItemPedido(prod, 0));
});

it("[ItemPedido] deve rejeitar objeto não-Produto", () => {
  assertThrows(() => new ItemPedido({ id: "x" }, 1));
});

// ================================================================
// MODULE: orders — Pedido (Entidade)
// ================================================================

it("[Pedido] deve iniciar com status aberto e total zero", () => {
  const pedido = new Pedido();
  assertEqual(pedido.getStatus(), Pedido.STATUS.ABERTO);
  assertEqual(pedido.getTotal(),  0);
  assertEqual(pedido.temItens(),  false);
});

it("[Pedido] deve acumular total corretamente", () => {
  const pedido = new Pedido();
  const svc = new OrderService(pedido);
  svc.adicionarItem("pastel", 2);       // R$10
  svc.adicionarItem("refrigerante", 1); // R$4
  assertApprox(pedido.getTotal(), 14);
});

it("[Pedido] removerUltimoItem deve reduzir total", () => {
  const pedido = new Pedido();
  const svc = new OrderService(pedido);
  svc.adicionarItem("pastel", 2); // R$10
  svc.adicionarItem("caldo",  1); // R$7 → total R$17
  svc.removerUltimoItem();         //     → total R$10
  assertApprox(pedido.getTotal(), 10);
});

it("[Pedido] limpar deve zerar tudo", () => {
  const pedido = new Pedido();
  const svc = new OrderService(pedido);
  svc.adicionarItem("suco", 5);
  svc.limpar();
  assertEqual(pedido.getTotal(),  0);
  assertEqual(pedido.temItens(), false);
});

it("[Pedido] finalizar deve mudar status", () => {
  const pedido = new Pedido();
  const svc = new OrderService(pedido);
  svc.adicionarItem("pastel", 1);
  svc.finalizar();
  assertEqual(pedido.getStatus(), Pedido.STATUS.FINALIZADO);
});

it("[Pedido] não deve finalizar sem itens", () => {
  const pedido = new Pedido();
  const svc = new OrderService(pedido);
  assertThrows(() => svc.finalizar());
});

// ================================================================
// MODULE: orders — OrderRepository (Singleton)
// ================================================================

it("[OrderRepository] deve retornar a mesma instância (Singleton)", () => {
  const r1 = new OrderRepository();
  const r2 = new OrderRepository();
  assertEqual(r1 === r2, true);
});

// ================================================================
// MODULE: payments — PaymentService (Strategy)
// ================================================================

it("[PaymentService] sem desconto para total <= R$50", () => {
  const d = PaymentService.calcularDesconto(30);
  assertEqual(d.valor,      0);
  assertEqual(d.percentual, 0);
});

it("[PaymentService] desconto 10% para total entre R$50 e R$100", () => {
  const d = PaymentService.calcularDesconto(60);
  assertApprox(d.valor, 6);
  assertEqual(d.percentual, 10);
});

it("[PaymentService] desconto 20% para total acima de R$100", () => {
  const d = PaymentService.calcularDesconto(120);
  assertApprox(d.valor, 24);
  assertEqual(d.percentual, 20);
});

it("[PaymentService] fronteira R$50 exato não tem desconto", () => {
  const d = PaymentService.calcularDesconto(50);
  assertEqual(d.valor, 0);
});

it("[PaymentService] fronteira R$100 exato tem 10%", () => {
  const d = PaymentService.calcularDesconto(100);
  assertApprox(d.valor, 10);
  assertEqual(d.percentual, 10);
});

// ================================================================
// MODULE: orders — OrderService (resumo completo)
// ================================================================

it("[OrderService] resumo correto — R$60 → desc 10% + taxa 5%", () => {
  const pedido = new Pedido();
  const svc = new OrderService(pedido);
  svc.adicionarItem("suco", 10); // R$6 x10 = R$60
  const r = svc.calcularResumo();
  assertApprox(r.subtotal,    60);
  assertApprox(r.desconto,     6);
  assertApprox(r.taxaServico,  3);
  assertApprox(r.totalFinal,  57);
});

it("[OrderService] resumo correto — R$120 → desc 20% + taxa 5%", () => {
  const pedido = new Pedido();
  const svc = new OrderService(pedido);
  svc.adicionarItem("suco", 20); // R$6 x20 = R$120
  const r = svc.calcularResumo();
  assertApprox(r.subtotal,    120);
  assertApprox(r.desconto,     24);
  assertApprox(r.taxaServico,   6);
  assertApprox(r.totalFinal,  102);
});

it("[OrderService] resumo correto — R$30 → sem desc + taxa 5%", () => {
  const pedido = new Pedido();
  const svc = new OrderService(pedido);
  svc.adicionarItem("pastel", 6); // R$5 x6 = R$30
  const r = svc.calcularResumo();
  assertApprox(r.subtotal,    30);
  assertApprox(r.desconto,     0);
  assertApprox(r.taxaServico,  1.5);
  assertApprox(r.totalFinal,  31.5);
});

// ================================================================
// MODULE: payments — PaymentRepository (Singleton)
// ================================================================

it("[PaymentRepository] deve retornar a mesma instância (Singleton)", () => {
  const r1 = new PaymentRepository();
  const r2 = new PaymentRepository();
  assertEqual(r1 === r2, true);
});

// ================================================================
// MODULE: auth — Usuario (Entidade)
// ================================================================

it("[Usuario] deve criar com papel correto", () => {
  const u = new Usuario({ id: "u1", nome: "Admin", papel: "admin" });
  assertEqual(u.getNome(),  "Admin");
  assertEqual(u.getPapel(), "admin");
  assertTrue(u.isAdmin());
});

it("[Usuario] atendente não deve ser admin", () => {
  const u = new Usuario({ id: "u2", nome: "Aten", papel: "atendente" });
  assertEqual(u.isAdmin(), false);
});

it("[Usuario] deve lançar erro sem id", () => {
  assertThrows(() => new Usuario({ nome: "X", papel: "admin" }));
});

// ================================================================
// EXIBIÇÃO DOS RESULTADOS
// ================================================================

function exibirResultados() {
  const total  = resultados.length;
  const passed = resultados.filter((r) => r.ok).length;
  const failed = total - passed;

  if (typeof process !== "undefined") {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  🧪 PASTELARIA DO ZÉ — Testes (Arquitetura Modular)`);
    console.log(`${"=".repeat(60)}`);
    resultados.forEach((r) => {
      const icon = r.ok ? "✅" : "❌";
      console.log(`${icon}  ${r.descricao}${r.erro ? "\n     ↳ " + r.erro : ""}`);
    });
    console.log(`${"=".repeat(60)}`);
    console.log(`  Resultado: ${passed}/${total} ${failed > 0 ? `(${failed} falhas)` : "🎉 todos passaram"}`);
    console.log(`${"=".repeat(60)}\n`);
    if (failed > 0) process.exit(1);
  }

  return { total, passed, failed, resultados };
}

const relatorio = exibirResultados();
