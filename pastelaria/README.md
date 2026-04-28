# 🍴 Pastelaria do Zé — Sistema Refatorado

## 🎓 Disciplina
**Arquitetura de Sistemas**  
**Professor:** Dr. Renato William Rodrigues de Souza  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Instituição:** IFCE — Campus Boa Viagem  


## Estrutura do Projeto

```
/
├── index.html                  ← Ponto de entrada
├── package.json                ← Scripts e dependências
├── db/
│   └── db.json                 ← Banco fake (JSON Server)
├── src/
│   ├── models/
│   │   ├── Produto.js          ← Entidade Produto
│   │   ├── ItemPedido.js       ← Entidade ItemPedido
│   │   ├── Pedido.js           ← Entidade Pedido
│   │   └── Factories.js        ← Padrão Factory
│   ├── services/
│   │   ├── PedidoService.js    ← Regras de negócio
│   │   ├── DescontoStrategy.js ← Padrão Strategy
│   │   └── EventBus.js         ← Padrão Observer (Singleton)
│   ├── repositories/
│   │   └── PedidoRepository.js ← Padrão Repository (Singleton)
│   ├── controllers/
│   │   └── PedidoController.js ← Intermediário UI ↔ Lógica
│   └── views/
│       ├── PedidoView.js       ← Única camada que toca o DOM
│       └── style.css           ← Estilos
└── tests/
    ├── pedido.test.js          ← Testes de unidade
    └── runner.html             ← Executor de testes no browser
```


## Como Executar

### 1. Abrir o sistema
Abra `index.html` diretamente no navegador.

### 2. Rodar a API fake (JSON Server)
```bash
npm install
npm run api
# Acesse: http://localhost:3000/pedidos
```

### 3. Rodar os testes
Abra `tests/runner.html` no navegador  
**ou** execute via terminal:
```bash
node tests/pedido.test.js
```


## Parte 11 — Justificativa Técnica

## 1. Quais problemas foram resolvidos?

| Problema original | Solução aplicada |
|------------------|------------------|
| Uso de variáveis globais (`itens`, `total`) | Encapsulamento nas classes `Pedido` e `PedidoService` |
| Função `calcularTotal` duplicada | Centralização do cálculo no método `calcularTotal()` da classe `Pedido` |
| Acoplamento entre DOM e lógica | Separação completa: lógica na camada de Service e manipulação do DOM na View |
| Uso de `localStorage` espalhado | Centralização no `PedidoRepository` |
| Ausência de arquitetura definida | Implementação de arquitetura em camadas (Model, Service, Controller, Repository, View) |
| Falta de validação | Validações implementadas nas camadas de Service e Factory |
| Ausência de padrões de projeto | Aplicação dos padrões Factory, Singleton, Strategy, Observer e Repository |


## 2. Como a arquitetura melhorou o sistema?

A adoção de uma arquitetura em camadas garantiu a separação de responsabilidades, permitindo que cada componente do sistema possua uma única razão para mudança.

Com isso:

- Alterações na persistência afetam apenas o `PedidoRepository`
- Mudanças nas regras de negócio impactam apenas os Services (ex: `DescontoStrategy`)
- Modificações na interface ficam restritas à View (`PedidoView` e `style.css`)
- O fluxo da aplicação é controlado exclusivamente pelo `PedidoController`

Essa organização reduz o acoplamento, aumenta a coesão e torna o sistema mais **escalável, reutilizável e de fácil manutenção**, além de prepará-lo para futuras evoluções, como integração com banco de dados real, autenticação e múltiplos usuários.


## 3. Onde os padrões foram aplicados?

### Factory — `src/services/ProdutoFactory.js`

Responsável pela criação dos objetos de domínio (Produtos).

Antes: criação manual com múltiplos `if` espalhados pelo código.  
Depois: criação centralizada e padronizada (`ProdutoFactory.criar(tipo)`), melhorando legibilidade e manutenção.


### Singleton — `PedidoService` / `PedidoRepository`

Garante a existência de uma única instância responsável pelo controle do pedido e pela persistência de dados.

Evita inconsistências e facilita o gerenciamento do estado global da aplicação.


### Strategy — `src/services/DescontoStrategy.js`

Define diferentes estratégias de cálculo de desconto (`SemDesconto`, `Desconto10`, `Desconto20`).

A estratégia é escolhida dinamicamente conforme o valor do pedido, eliminando estruturas condicionais complexas (`if/else`).


### Observer — `PedidoService` + `PedidoView`

A View se registra como observadora do Service.

Sempre que o pedido é alterado, o Service notifica a View, que atualiza automaticamente a interface, sem acoplamento direto entre as camadas.


### Repository — `src/repositories/PedidoRepository.js`

Responsável por abstrair o acesso aos dados.

Centraliza a persistência (ex: `localStorage`), permitindo futura substituição por API ou banco de dados sem impactar as demais camadas.


## 4. Quais benefícios foram obtidos?

- **Testabilidade**: a lógica de negócio é independente do DOM, permitindo testes isolados  
- **Manutenibilidade**: cada classe possui responsabilidade única (princípio SRP)  
- **Extensibilidade**: novas funcionalidades podem ser adicionadas com baixo impacto no sistema  
- **Organização**: código estruturado e mais fácil de entender  
- **Escalabilidade**: preparado para evoluir com novas tecnologias e integrações  
- **Desacoplamento**: redução da dependência entre componentes  


## Diagrama de Classes (texto)

┌──────────────┐       usa       ┌────────────────────┐
│   Produto    │◄────────────────│  ProdutoFactory    │
│ ───────────  │                 │  + criar(id)       │
│ id: string   │                 └────────────────────┘
│ nome: string │
│ preco: number│       usa       ┌────────────────────┐
└──────────────┘◄────────────────│ItemPedidoFactory   │
       ▲                         │ + criar(id, qtd)   │
       │ contém                  └────────────────────┘
┌──────────────┐
│  ItemPedido  │       usa       ┌────────────────────┐
│ ───────────  │◄─────────────── │   PedidoFactory    │
│ produto      │                 │   + criar()        │
│ quantidade   │                 └────────────────────┘
│ getSubtotal()│
└──────┬───────┘
       │ compõe
┌──────▼───────┐    usa    ┌──────────────────────┐
│    Pedido    │◄──────────│    PedidoService     │
│ ──────────── │           │ ──────────────────── │
│ id           │           │ adicionarItem()      │
│ itens[]      │           │ calcularResumo()     │
│ status       │           │ finalizar()          │
│ getTotal()   │           │ gerarMensagemWA()    │
└──────────────┘           └──────────┬───────────┘
                                      │ usa
                           ┌──────────▼───────────┐
                           │  DescontoStrategy    │
                           │  (Strategy)          │
                           │ ──────────────────── │
                           │ SemDesconto          │
                           │ DescontoMedio        │
                           │ DescontoAlto         │
                           └──────────────────────┘

┌─────────────────────┐    emite    ┌──────────────────┐
│  PedidoController   │────────────►│    EventBus      │
│ ──────────────────  │             │  (Singleton +    │
│ adicionar()         │             │   Observer)      │
│ finalizar()         │◄────────────│  on/emit/off     │
│ limpar()            │   observa   └──────────────────┘
└─────────┬───────────┘                      ▲
          │ usa                              │ observa
┌─────────▼───────────┐             ┌────────┴──────────┐
│  PedidoRepository   │             │    PedidoView     │
│  (Singleton +       │             │ ────────────────  │
│   Repository)       │             │ DOM manipulation  │
│ salvarLocal()       │             │ _renderizarLista()│
│ salvarAPI()         │             │ _abrirModal()     │
└─────────────────────┘             └───────────────────┘


