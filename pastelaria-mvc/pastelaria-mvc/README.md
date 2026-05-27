# 🍴 Pastelaria do Zé — Refatoração MVC

## 🎓 Disciplina
**Arquitetura de Sistemas**  
**Professor:** Dr. Renato William Rodrigues de Souza  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Instituição:** IFCE — Campus Boa Viagem  
**Atividade:** Prática Orientada 05 — Refatoração para o Padrão MVC

---

## Estrutura do Projeto

```
/
├── index.html                        ← Ponto de entrada
├── package.json                      ← Scripts e dependências
├── db/
│   └── db.json                       ← Banco fake (JSON Server)
├── src/
│   ├── models/
│   │   ├── Produto.js                ← Entidade Produto
│   │   ├── ItemPedido.js             ← Entidade ItemPedido
│   │   ├── Pedido.js                 ← Entidade Pedido
│   │   └── Factories.js              ← Padrão Factory
│   ├── services/
│   │   ├── PedidoService.js          ← Regras de negócio
│   │   ├── DescontoService.js        ← Padrão Strategy (isolado)
│   │   └── EventBus.js               ← Padrão Observer + Singleton
│   ├── repositories/
│   │   └── PedidoRepository.js       ← Padrão Repository + Singleton
│   ├── controllers/
│   │   └── PedidoController.js       ← Orquestra fluxo MVC
│   └── views/
│       ├── PedidoView.js             ← Única camada que toca o DOM
│       └── style.css                 ← Estilos
└── tests/
    ├── pedido.test.js                ← Testes de unidade (28 testes)
    └── runner.html                   ← Executor visual no browser
```

---

## Como Executar

### 1. Abrir o sistema
```bash
# Basta abrir index.html diretamente no navegador
```

### 2. Rodar a API fake (JSON Server)
```bash
npm install
npm run api
# Acesse: http://localhost:3000/pedidos
```

### 3. Rodar os testes
```bash
# Via terminal (Node.js)
npm test

# Via navegador: abra tests/runner.html
```

---

## Commits no Git

```bash
git checkout -b refatoracao-mvc

git add src/models/
git commit -m "Refatoracao inicial para MVC"

git add src/services/
git commit -m "Separacao das regras de negocio em services"

git add src/repositories/
git commit -m "Implementacao do repository pattern"

git add src/views/
git commit -m "Criacao das views desacopladas"

git add src/services/EventBus.js
git commit -m "Aplicacao do padrao Observer"

git add tests/
git commit -m "Testes unitarios completos para arquitetura MVC"

git add .
git commit -m "Documentacao e analise arquitetural MVC completa"
```

---

## Parte 7 — Análise Arquitetural

### 1. O MVC melhorou a organização?

Sim, de forma significativa. A separação em camadas formalizou o que antes era implícito.
Com MVC, cada arquivo tem um propósito claro e imediatamente compreensível:
qualquer desenvolvedor novo consegue identificar onde está cada responsabilidade
sem precisar ler o código inteiro.

### 2. O sistema ficou mais desacoplado?

Sim. A grande melhoria está na comunicação via EventBus (Observer):
o Controller não precisa conhecer a View diretamente — ele apenas emite eventos
e a View reage. Isso significa que a View pode ser totalmente substituída
(por uma interface mobile, CLI ou outro front-end) sem alterar o Controller.

### 3. Onde ainda existem problemas?

- A `PedidoView` ainda depende de IDs específicos do HTML (acoplamento com o DOM)
- O catálogo de produtos está hardcoded no `Produto.CATALOGO` — deveria vir do Repository
- O `PedidoController` conhece o ciclo de vida completo do pedido, ficando um pouco mais
  "gordo" conforme o sistema cresce

### 4. O MVC seria suficiente para um sistema muito grande?

Não. Em sistemas maiores, o MVC tradicional apresenta os chamados "Massive Controllers"
e "Massive Views". Arquiteturas como Clean Architecture, MVVM ou Hexagonal Architecture
resolvem esses problemas com mais camadas de abstração e inversão de dependência formal.

### 5. Quais limitações foram percebidas?

- **Controllers que crescem**: toda nova funcionalidade tende a ir para o Controller
- **Views difíceis de testar**: qualquer teste da View depende de um DOM real
- **Navegação em projetos grandes**: com muitos arquivos, encontrar onde algo acontece fica difícil
- **Reatividade manual**: sem um framework, cada atualização de tela precisa ser codificada explicitamente

### 6. Onde os Services ajudaram?

Os Services permitiram isolar completamente as regras de negócio:
- `PedidoService` concentra todo o fluxo de um pedido (adicionar, calcular, finalizar, WhatsApp)
- `DescontoService` encapsula as estratégias de desconto, podendo ser testado isoladamente
- Ambos são testáveis sem DOM, sem banco, sem interface — apenas com objetos puros

### 7. Onde os Repositories ajudaram?

O `PedidoRepository` criou uma fronteira clara entre "lógica" e "dados":
- O Service não sabe se os dados vão para `localStorage`, `IndexedDB` ou uma API real
- Toda a lógica de persistência (chaves do localStorage, URL da API, tratamento de erros de rede)
  está em um único lugar
- Substituir o backend (ex: migrar de JSON Server para Firebase) afeta **apenas** o Repository

---

## Parte 8 — Problemas do MVC Tradicional em Sistemas Grandes

### Controllers gordos
À medida que o sistema cresce, o Controller acumula responsabilidades:
autenticação, autorização, validação, log, notificações, cache.
O que era simples vira uma classe com 500+ linhas difícil de manter.

### Excesso de responsabilidades
No MVC clássico não existe lugar formal para: autenticação, formatação,
validação complexa, cache, internacionalização. Tudo vai para Controller ou Service,
criando inchaço progressivo.

### Dificuldade de manutenção
Com Controllers gordos, qualquer mudança em uma funcionalidade pode afetar outras
que parecem não ter relação. O risco de regressão aumenta drasticamente.

### Dificuldade de navegação
Em um projeto com 20+ entidades, encontrar exatamente onde uma regra de negócio
está implementada exige conhecer profundamente toda a base de código.

### Aumento do acoplamento
Sem disciplina, o Controller começa a depender de detalhes das Views
(conhecer IDs de campos, por exemplo) e os Services começam a referenciar
uns aos outros de forma circular.

### Dificuldade de escalabilidade
O MVC tradicional não define como dividir o código em módulos independentes.
Escalar a equipe (múltiplos times trabalhando em paralelo) se torna conflituoso
porque todos editam os mesmos arquivos centrais.

---

## Parte 9 — Comparação Arquitetural

| Critério                  | Sistema Original (Atividade 04) | MVC Refatorado (Atividade 05)   |
|---------------------------|----------------------------------|---------------------------------|
| **Organização**           | Em camadas, sem nomenclatura formal de MVC | Explicitamente MVC com pastas e responsabilidades claras |
| **Coesão**                | Alta (cada classe com uma responsabilidade) | Alta — e agora com papéis formalmente definidos |
| **Acoplamento**           | Baixo (EventBus já presente)    | Baixo — View e Controller comunicam-se apenas via EventBus |
| **Reutilização**          | Models e Services reutilizáveis | Idem, com DescontoService ainda mais isolado |
| **Clareza estrutural**    | Boa, mas requer leitura do código para entender papéis | Excelente — a pasta já informa o papel do arquivo |
| **Escalabilidade**        | Limitada pelo MVC                | Idem — MVC tem teto de complexidade |
| **Facilidade de manutenção** | Boa                          | Melhor — regras isoladas em Services testáveis |

---

## Parte 10 — Modelagem

### Diagrama de Classes

```
┌──────────────┐  usa  ┌────────────────────┐
│   Produto    │◄──────│  ProdutoFactory    │
│ ──────────── │       │  + criar(id)       │
│ id: string   │       │  + listarTodos()   │
│ nome: string │       └────────────────────┘
│ preco: number│
│ CATALOGO     │  usa  ┌────────────────────┐
└──────────────┘◄──────│ItemPedidoFactory   │
       ▲                │ + criar(id, qtd)  │
       │ contém         └────────────────────┘
┌──────┴───────┐
│  ItemPedido  │  usa  ┌────────────────────┐
│ ──────────── │◄──────│  PedidoFactory     │
│ produto      │       │  + criar()         │
│ quantidade   │       └────────────────────┘
│ getSubtotal()│
└──────┬───────┘
       │ compõe
┌──────▼───────┐  usa  ┌──────────────────────────┐
│    Pedido    │◄──────│      PedidoService        │
│ ──────────── │       │ ─────────────────────── │
│ id           │       │ adicionarItem()           │
│ itens[]      │       │ removerUltimoItem()       │
│ status       │       │ calcularResumo()          │
│ getTotal()   │       │ finalizar()               │
│ finalizar()  │       │ gerarMensagemWhatsApp()  │
└──────────────┘       └──────────┬───────────────┘
                                  │ delega
                       ┌──────────▼───────────────┐
                       │     DescontoService       │
                       │ (Strategy Pattern)        │
                       │ ───────────────────────  │
                       │ SemDescontoStrategy       │
                       │ DescontoMedioStrategy     │
                       │ DescontoAltoStrategy      │
                       │ DescontoStrategySelector  │
                       └──────────────────────────┘

┌──────────────────────┐  emite  ┌──────────────────┐
│  PedidoController    │────────►│    EventBus      │
│ ──────────────────── │         │  (Singleton +    │
│ adicionar()          │         │   Observer)      │
│ removerUltimo()      │◄────────│  on/emit/off     │
│ finalizar()          │ observa └──────────────────┘
│ limpar()             │                  ▲
└──────────┬───────────┘                  │ observa
           │ usa                ┌─────────┴──────────┐
┌──────────▼───────────┐        │    PedidoView      │
│  PedidoRepository    │        │ ────────────────── │
│  (Singleton +        │        │ _renderizarLista() │
│   Repository)        │        │ _abrirModal()      │
│ salvarPedidoLocal()  │        │ _exibirToast()     │
│ carregarPedidoLocal()│        │ _bindEventosUI()   │
│ salvarPedidoAPI()    │        └────────────────────┘
└──────────────────────┘
```

### Fluxo MVC

```
Usuário clica "Adicionar"
         │
         ▼
    PedidoView._onAdicionar()
         │ chama
         ▼
    PedidoController.adicionar(produtoId, qtd)
         │ aciona
         ├──► PedidoService.adicionarItem()
         │         │ usa
         │         ├──► ItemPedidoFactory.criar()
         │         │         │ usa
         │         │         └──► ProdutoFactory.criar() → Produto
         │         │                                        ↓
         │         │                                    ItemPedido
         │         └──► Pedido.adicionarItem(item)  [Model atualizado]
         │
         ├──► PedidoRepository.salvarPedidoLocal(pedido)
         │
         └──► EventBus.emit(PEDIDO_ATUALIZADO, { itens, total })
                   │
                   ▼ (Observer)
             PedidoView._renderizarLista(itens, total)
                   │
                   ▼
              DOM atualizado ← usuário vê a mudança
```

---

## Parte 11 — Estrutura Esperada (Conforme Enunciado)

```
/src
  /models
    Produto.js      ✔
    Pedido.js       ✔
    ItemPedido.js   ✔
    Factories.js    ✔  (ProdutoFactory + ItemPedidoFactory + PedidoFactory)
  /controllers
    PedidoController.js   ✔
  /services
    PedidoService.js      ✔
    DescontoService.js    ✔  (Strategy isolado)
    EventBus.js           ✔  (Observer + Singleton)
  /repositories
    PedidoRepository.js   ✔  (Singleton + Repository)
  /views
    PedidoView.js         ✔
    style.css             ✔
```

---

## Padrões de Projeto Implementados

| Padrão       | Onde                                    | Justificativa                                                    |
|--------------|-----------------------------------------|------------------------------------------------------------------|
| **Factory**  | `Factories.js`                          | Centraliza criação de Produto, ItemPedido e Pedido com validação |
| **Singleton**| `EventBus`, `PedidoRepository`          | Garante instância única; evita inconsistências de estado global  |
| **Repository**| `PedidoRepository`                     | Abstrai persistência; facilita troca de backend sem impacto      |
| **Strategy** | `DescontoService` + estratégias         | Elimina if/else para desconto; novas faixas sem alterar Service  |
| **Observer** | `EventBus` + `PedidoView`              | Desacopla Controller e View; comunicação via eventos             |

---

## Regras Arquiteturais Respeitadas

### Models
- ✔ Contêm apenas entidades, estrutura de dados e comportamento próprio
- ✔ Não conhecem DOM, Services, Repositories ou Controllers
- ✔ São testáveis de forma completamente isolada

### Views
- ✔ Única camada que acessa e manipula o DOM
- ✔ Não contêm regras de negócio
- ✔ Não acessam dados diretamente
- ✔ Não realizam cálculos
- ✔ Delegam tudo ao Controller

### Controllers
- ✔ Recebem eventos da View e coordenam o fluxo
- ✔ Chamam Services para regras de negócio
- ✔ Chamam Repository para persistência
- ✔ Notificam a View via EventBus
- ✔ Não contêm regras de negócio complexas
- ✔ Não acessam dados diretamente

### Services
- ✔ Concentram todas as regras de negócio
- ✔ Calculam totais, descontos e taxas
- ✔ Não conhecem DOM ou detalhes de persistência

### Repositories
- ✔ Abstraem completamente o acesso a dados
- ✔ Comunicam com localStorage e JSON Server
- ✔ Tratam erros de rede de forma transparente

---

*"Arquitetura não é apenas organização. É a capacidade de permitir evolução contínua do software."*
