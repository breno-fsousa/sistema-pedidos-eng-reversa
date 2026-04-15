# Análise do Sistema Real

## Parte 1 – Análise Geral

### 1. Objetivo do sistema

O sistema tem como objetivo permitir a realização de pedidos online de pizzas e lanches, facilitando a interação entre cliente e estabelecimento.


### 2. Funcionalidades

- Visualização de produtos
- Organização por categorias
- Adição ao carrinho
- Finalização de pedidos
- Escolha de formas de pagamento
- Informações de contato


### 3. Interação do usuário

O usuário navega pelo site através de:

1. Seleção de produtos
2. Adição ao carrinho
3. Revisão do pedido
4. Finalização

A interação é simples e direta, focada em conversão de pedidos.


### 4. Organização dos produtos

Os produtos são organizados por categorias, como:

- Pizzas
- Lanches
- Bebidas

Essa estrutura facilita a navegação e busca.


## Parte 2 – Arquitetura

### Tipo de Arquitetura

O sistema aparenta utilizar uma arquitetura **cliente-servidor**, com forte característica de aplicação web.



### Divisão em camadas

Possível divisão:

- **Frontend:** Interface do usuário (HTML, CSS, JS)
- **Backend:** Processamento de pedidos
- **Banco de Dados:** Armazenamento de produtos e pedidos


### Separação de responsabilidades

Existe separação básica:

- Interface → apresentação
- Backend → lógica
- Banco → persistência

Porém, essa separação pode não ser bem estruturada internamente.


## Parte 3 – Design

### Coesão

A coesão é **moderada**, pois cada parte cumpre sua função principal, mas pode haver mistura de responsabilidades.


### Acoplamento

O acoplamento aparenta ser **alto**, pois alterações no sistema podem impactar várias partes.


### Separação de responsabilidades

Existe, porém não claramente definida, indicando possível falta de arquitetura formal (como MVC bem estruturado).