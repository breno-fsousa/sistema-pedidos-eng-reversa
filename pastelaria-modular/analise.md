# 🔍 Análise Arquitetural — Engenharia Reversa do MVC

## Parte 1 — Engenharia Reversa da Arquitetura MVC Original

### 1. Como o MVC atual estava organizado?

O sistema MVC (Atividade 05) possuía a seguinte estrutura:

```
/src
  /models       → Produto, ItemPedido, Pedido, Factories
  /services     → PedidoService, DescontoService, EventBus
  /repositories → PedidoRepository
  /controllers  → PedidoController
  /views        → PedidoView, style.css
```

A organização era **por tipo de camada** (todas as entidades juntas, todos os
services juntos etc.), o que é característico do MVC tradicional. Funciona bem
em sistemas pequenos, mas começa a apresentar problemas conforme o projeto cresce.

---

### 2. Onde existiam problemas arquiteturais?

| Local                | Problema identificado                                          |
|----------------------|----------------------------------------------------------------|
| `PedidoController`   | Orquestrava pedido, persistência, WhatsApp e sessão ao mesmo tempo |
| `PedidoService`      | Misturava regras de pedido com lógica de desconto e formatação de mensagem |
| `DescontoService`    | Solto em `/services` sem pertencer claramente a nenhum domínio |
| `EventBus`           | Recurso compartilhado sem espaço formal de "shared" na estrutura |
| `/models`            | Produto, Pedido e ItemPedido no mesmo nível, sem separação por domínio |

---

### 3. Existiam controllers gordos?

O `PedidoController` era o principal candidato ao "controller gordo". Ele:

- Instanciava o pedido, o service, o repository e o EventBus
- Controlava a restauração de sessão (`_restaurarSessao`)
- Coordenava o fluxo de finalização (service + repository + WhatsApp + EventBus)
- Reiniciava o ciclo de pedido após finalização

Em um sistema maior, esse controller acumularia autenticação, autorização, logs,
cache e notificações — tornando-se inviável de manter.

---

### 4. Onde estavam as regras de negócio?

- Cálculo de desconto → `DescontoService`
- Taxa de serviço → `PedidoService` (constante `TAXA_SERVICO = 0.05`)
- Validação de quantidade → `ItemPedidoFactory` (dentro de `/models`)
- Geração de link WhatsApp → `PedidoService`
- Restauração de sessão → `PedidoController`

As regras estavam **distribuídas em camadas diferentes** sem um critério claro de
qual domínio era dono de cada regra. O desconto era financeiro mas vivia em `/services`
ao lado do EventBus, que é infraestrutura.

---

### 5. Existiam responsabilidades misturadas?

Sim. Os principais casos:

**`PedidoService`** tinha três responsabilidades distintas:
1. Gerenciar ciclo de vida do pedido (adicionar, remover, finalizar)
2. Calcular resumo financeiro (desconto + taxa)
3. Gerar mensagem de WhatsApp (formatação de apresentação)

**`PedidoController`** tinha duas responsabilidades:
1. Orquestrar o fluxo do pedido
2. Gerenciar a recuperação de sessão (responsabilidade de infraestrutura)

**`Factories.js`** agrupava três factories sem separação por domínio:
`ProdutoFactory`, `ItemPedidoFactory` e `PedidoFactory` no mesmo arquivo.

---

### 6. O sistema estava preparado para crescer?

Não completamente. Os problemas que surgiriam com crescimento:

- Adicionar autenticação exigiria mexer no `PedidoController` e na `PedidoView`
- Adicionar um módulo de pagamentos não teria lugar natural na estrutura
- Dois desenvolvedores trabalhando em "produtos" e "pedidos" editariam os mesmos arquivos
- Encontrar onde está a regra de desconto exigiria conhecer toda a estrutura
- Testes de integração entre pedidos e pagamentos não teriam fronteiras claras

---

## Parte 7 — Problemas do MVC Tradicional

### Controllers gordos

No MVC, o Controller é o ponto natural de chegada de tudo que não tem lugar claro.
Autenticação? Vai pro Controller. Log? Vai pro Controller. Cache? Controller.
Notificações? Controller. O resultado é uma classe com centenas de linhas
que é difícil de testar, entender e modificar sem quebrar outras coisas.

### Dificuldade de manutenção

Para corrigir um bug no cálculo de desconto, o desenvolvedor precisa:
1. Lembrar que desconto está em `DescontoService`
2. Saber que `DescontoService` é chamado por `PedidoService`
3. Entender que `PedidoService` é instanciado no `PedidoController`
4. Verificar se a mudança afeta os testes em `pedido.test.js`

Em um projeto maior, esse rastreamento pode envolver 10+ arquivos.

### Acoplamento crescente

Com o tempo, Services começam a referenciar outros Services diretamente.
Controllers começam a conhecer detalhes da View (IDs de campos HTML).
Views começam a fazer pequenas validações "por conveniência". O acoplamento cresce
silenciosamente até que qualquer mudança exige alterar múltiplas camadas.

### Organização limitada por tipo, não por domínio

`/models`, `/services`, `/controllers` organizam o código por *o que é*,
não por *o que faz*. Isso significa que para entender "tudo sobre pedidos"
o desenvolvedor precisa olhar arquivos em 4 pastas diferentes.

### Crescimento desordenado

Sem fronteiras claras entre domínios, cada nova funcionalidade vai para onde
"parece mais certo" segundo o desenvolvedor do momento. Em 6 meses, a estrutura
não reflete mais nenhuma lógica coerente.

### Dificuldade de navegação

Em um projeto MVC com 20 entidades, o desenvolvedor olha para `/models` e vê
20 arquivos sem saber quais dependem de quais. Em `/services`, outros 20 arquivos
sem agrupamento lógico. A navegação por pasta não ajuda a entender o sistema.
