# Missões da Semana

Mini app familiar criado para acompanhar as atividades diárias da **Malu** e do **Miguel**, transformar combinados em missões simples e usar estrelas/moedas como base para prêmios no fim de semana.

A ideia do projeto é funcionar como um quadro de rotina gamificado: durante a semana, os responsáveis marcam as atividades como concluídas ou não; no fim da semana, o app mostra o saldo disponível para resgatar prêmios ou acumular moedas para a próxima semana.

## Link publicado

Quando o GitHub Actions terminar o deploy com sucesso, o app fica disponível em:

```text
https://pabloudimg.github.io/Malu_Miguel/
```

## Contexto do projeto

Este app começou como uma primeira versão simples para testar a rotina familiar antes de evoluir para algo com banco de dados ou login.

A versão atual já deixou de ser apenas um checklist diário e passou a ter uma lógica mais completa de acompanhamento semanal:

- cadastro e edição de atividades;
- marcação diária por criança;
- cálculo de estrelas acumuladas;
- modo claro/escuro;
- fotos personalizadas para Malu e Miguel;
- animações visuais no uso diário;
- prêmios configuráveis;
- resgate de prêmios com abatimento do saldo;
- transferência de moedas para a semana seguinte;
- backup e importação de dados.

## Crianças cadastradas inicialmente

O app vem com dois perfis iniciais:

- **Malu**, 9 anos;
- **Miguel**, 6 anos.

Cada perfil pode ter uma foto personalizada. A foto é selecionada diretamente no app e fica salva no navegador usado.

## Atividades iniciais

As atividades configuradas inicialmente são:

- Preparação para escola;
- Andar no carro de cinto;
- Fazer as refeições do dia;
- Escovar os dentes;
- Resolver conflitos sem bater/brigar.

Na aba **Atividades**, é possível:

- cadastrar novas atividades;
- editar ícone, descrição, estrelas e ordem;
- definir se uma atividade está ativa;
- reorganizar a posição com campo de ordem ou botões de seta;
- limitar estrelas e ordem entre `0` e `99`.

A ordem definida nessa tela controla como as atividades aparecem na aba **Hoje**.

## Marcação diária

Na aba **Hoje**, cada atividade pode receber uma das marcações:

- 👍 **OK**;
- 👎 **Não OK**;
- 😐 **N/A**.

Regras da marcação:

- 👍 OK soma as estrelas da atividade;
- 👎 Não OK não soma estrelas;
- 😐 N/A remove a atividade da conta do dia;
- clicar novamente em uma opção já marcada desmarca a atividade;
- ao marcar 👍 aparece uma animação com carinha feliz;
- ao marcar 👎 aparece uma animação com carinha triste.

Também existe um campo de **observações do dia** para registrar comentários importantes.

## Semana, moedas e prêmios

Na aba **Semana**, o app calcula o resumo semanal para cada criança.

Cada card mostra:

- percentual de conclusão da semana;
- ⭐ estrelas acumuladas na semana;
- ↔️ estrelas transferidas de semanas anteriores;
- 🏆 estrelas utilizadas em prêmios;
- 🧾 saldo de moedas disponíveis.

A fórmula do saldo é:

```text
moedas disponíveis = estrelas acumuladas + estrelas transferidas - estrelas utilizadas
```

### Resgate de prêmios

Cada prêmio tem um custo em moedas/estrelas.

Na aba **Semana**, dentro do card de cada criança, aparece a lista de **Prêmios possíveis**.

Regras de resgate:

- é possível resgatar mais de um prêmio na mesma semana;
- o app só permite resgatar se houver saldo suficiente;
- ao resgatar, o prêmio fica marcado como **Resgatado**;
- clicar novamente em um prêmio resgatado cancela o resgate e devolve as moedas;
- o total usado aparece na linha 🏆 estrelas utilizadas.

### Acumular moedas

Além dos prêmios cadastrados, existe sempre uma opção fixa no final da lista:

- 🪙 **Acumular moedas**.

Essa opção transfere o saldo disponível daquela semana para a semana seguinte.

Ela serve para evitar que as crianças percam estrelas quando o saldo da semana não for suficiente para um prêmio maior.

Exemplo:

```text
Semana atual:
20 estrelas acumuladas
0 transferidas
0 utilizadas
20 moedas disponíveis

Ao clicar em Acumular moedas:
20 moedas são levadas para a próxima semana
```

Na semana seguinte, essas moedas aparecem como ↔️ estrelas transferidas.

## Aba Prêmios

A antiga aba **Recompensas** foi renomeada para **Prêmios**.

Nela é possível cadastrar e editar:

- ícone;
- nome do prêmio;
- quantidade de estrelas/moedas exigidas.

O valor do prêmio é limitado de `0` a `99`.

## Aparência e uso no celular

O app foi ajustado para uso mobile, principalmente pensando em iPhone 14 Pro Max.

A versão atual inclui:

- layout responsivo;
- botões maiores para toque;
- navegação por abas com rolagem horizontal;
- suporte a área segura do iPhone;
- cards com efeito hover em telas maiores;
- animação de abertura;
- modo claro/escuro.

## Dados e armazenamento

Nesta fase, os dados ficam salvos no próprio navegador usando `localStorage`.

Isso inclui:

- fotos das crianças;
- atividades;
- marcações diárias;
- observações;
- prêmios;
- resgates;
- moedas transferidas.

## Limite importante da versão atual

Os dados ficam salvos apenas no navegador/dispositivo em que o app foi usado.

Se o app for aberto em outro celular, computador ou navegador, os dados não aparecem automaticamente.

Para levar os dados para outro dispositivo:

1. Entre na aba **Dados**.
2. Clique em **Exportar backup**.
3. No outro dispositivo, entre na aba **Dados**.
4. Clique em **Importar backup**.

Uma evolução futura pode usar Firebase ou Supabase para login e sincronização em nuvem.

## Estrutura principal do código

```text
Malu_Miguel/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
├─ src/
│  ├─ main.jsx
│  └─ styles.css
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.js
└─ README.md
```

Arquivos principais:

- `src/main.jsx`: concentra a lógica do app, componentes React, regras de pontuação, prêmios, resgates, transferências e armazenamento local;
- `src/styles.css`: define o visual, responsividade, dark mode, animações e ajustes mobile;
- `vite.config.js`: configura o Vite e o caminho correto para publicação no GitHub Pages;
- `.github/workflows/deploy.yml`: automatiza o build e publicação no GitHub Pages.

## Como rodar localmente

É necessário ter Node.js instalado.

```bash
npm install
npm run dev
```

Depois, abra o endereço mostrado no terminal.

## Como gerar a versão de produção

```bash
npm run build
npm run preview
```

O comando `npm run build` gera a pasta `dist/`, que é a versão final do app para publicação.

## Como publicar no GitHub Pages

O projeto já possui um workflow em:

```text
.github/workflows/deploy.yml
```

Fluxo de publicação:

1. Fazer alteração no código.
2. Enviar para a branch `main`.
3. O GitHub Actions roda automaticamente.
4. Ele instala as dependências.
5. Ele gera o build com Vite.
6. Ele publica a pasta `dist/` no GitHub Pages.

Para conferir o deploy:

1. Abra o repositório no GitHub.
2. Entre na aba **Actions**.
3. Aguarde o workflow ficar verde.
4. Acesse o link publicado.

## Tecnologias usadas

- React;
- Vite;
- CSS puro;
- localStorage;
- GitHub Pages;
- GitHub Actions.

## Ideias para próximas versões

- Login dos pais;
- sincronização entre dispositivos;
- banco de dados em nuvem;
- histórico mensal;
- regras diferentes por criança;
- atividades por dia da semana;
- relatórios simples para conversa no domingo;
- área infantil somente para visualização;
- instalação como PWA na tela inicial do iPhone;
- confirmação com senha para editar atividades, prêmios ou dados.
