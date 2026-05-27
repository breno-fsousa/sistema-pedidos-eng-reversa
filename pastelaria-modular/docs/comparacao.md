# ⚖️ Comparação Arquitetural — MVC vs Modular

## Parte 8 — Tabela Comparativa

| Critério                       | MVC (Atividade 05)                                                    | Modular (Atividade 06)                                                     |
|-------------------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------------|
| **Organização**               | Por tipo de camada (`/models`, `/services`, `/controllers`)           | Por domínio de negócio (`/orders`, `/products`, `/payments`, `/auth`)      |
| **Escalabilidade**            | Limitada — crescimento aumenta o tamanho dos arquivos existentes      | Alta — novo domínio = nova pasta sem tocar o restante                      |
| **Acoplamento**               | Moderado — Services podem referenciar uns aos outros sem fronteiras   | Baixo — módulos comunicam-se apenas via EventBus ou camada de Service      |
| **Reutilização**              | Baixa — classes atreladas ao contexto "pastelaria" inteiro            | Alta — cada módulo é independente e reutilizável em outros contextos       |
| **Facilidade de manutenção**  | Razoável em escala pequena; difícil em escala maior                   | Boa em qualquer escala — mudança em `payments` não afeta `orders`          |
| **Separação de responsab.**   | Parcial — camadas separadas mas domínios misturados                   | Total — cada módulo tem entities, services, repositories e controllers     |
| **Facilidade de navegação**   | Requer conhecer a estrutura toda para localizar uma regra             | Intuitiva — "regras de desconto?" → `/payments/services/PaymentService.js` |

---

## Análise detalhada por critério

### Organização

No MVC, abrir a pasta `/services` mostra `PedidoService`, `DescontoService` e `EventBus`
lado a lado, sem indicar que os dois primeiros são de domínios diferentes e o terceiro
é infraestrutura compartilhada.

Na arquitetura modular, a estrutura de pastas **conta a história do negócio**:
- `/orders` → tudo sobre pedidos
- `/payments` → tudo sobre pagamentos e descontos
- `/products` → tudo sobre o cardápio
- `/auth` → tudo sobre usuários e sessão
- `/shared` → recursos transversais sem dono de domínio

---

### Escalabilidade

Para adicionar "histórico de pedidos" no MVC:
- Criar `PedidoHistorico.js` em `/models`
- Criar `HistoricoService.js` em `/services`
- Modificar `PedidoController` para incluir a nova funcionalidade
- Modificar `PedidoView` para exibir o histórico

Para adicionar o mesmo na arquitetura modular:
- Criar pasta `/modules/history/`
- Implementar entities, services, repositories e controllers internamente
- Conectar ao resto via EventBus
- **Zero impacto nos outros módulos**

---

### Acoplamento

No MVC, `PedidoService` chamava `DescontoService` diretamente — um acoplamento
forte que impede testar um sem o outro.

Na arquitetura modular, `OrderService` chama `PaymentService.calcularDesconto()`,
mas essa é a **única** ponte entre os módulos. Se `PaymentService` mudar sua
implementação interna, `OrderService` não precisa mudar nada — desde que a
assinatura do método permaneça a mesma.

---

### Reutilização

No MVC, `PedidoService` conhecia detalhes de formatação WhatsApp, cálculo financeiro
e gerenciamento de itens — impossível reutilizá-lo em outro contexto sem trazer
toda essa lógica acoplada.

Na arquitetura modular, `ProductService` pode ser usado por qualquer outro sistema
que precise de um catálogo de produtos. `PaymentService` pode calcular descontos
para qualquer contexto. Cada módulo é uma unidade reutilizável por si só.

---

### Perguntas norteadoras respondidas

**O sistema ficou mais organizado?**
Sim. A estrutura de pastas reflete diretamente os domínios de negócio.

**A modularização facilitou a navegação?**
Sim. Para qualquer funcionalidade, a pasta correta é imediata.

**Os controllers ficaram menores?**
Sim. `OrderController` tem responsabilidade única (orquestrar pedidos).
Autenticação ficou em `AuthController`. Pagamentos em `PaymentController`.

**O sistema ficou mais desacoplado?**
Sim. Os módulos comunicam-se via EventBus — nenhum importa o outro diretamente.

**Os módulos possuem responsabilidades claras?**
Sim. Cada módulo declara explicitamente o que faz através de sua estrutura interna.

**O projeto agora suporta crescimento?**
Sim. Adicionar um módulo `delivery` ou `loyalty` (fidelidade) não exige alterar
nenhum módulo existente — apenas criá-lo e conectá-lo via EventBus.

**Como a arquitetura influencia a equipe?**
Times diferentes podem trabalhar em módulos diferentes sem conflito. Um time
cuida de `/orders`, outro de `/payments`, sem risco de sobrescrever o trabalho
um do outro. As interfaces entre módulos (via EventBus e Services públicos) funcionam
como contratos entre times.
