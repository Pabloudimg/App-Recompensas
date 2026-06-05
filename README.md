# Level Up

App familiar gamificado para acompanhar rotinas diárias de crianças, registrar conquistas, acumular estrelas/moedas e trocar o saldo por prêmios definidos pela família.

O projeto nasceu como uma agenda de atividades para Malu e Miguel, mas evoluiu para um app multiusuário com login Google, família compartilhada, banco em nuvem no Firebase e convites para responsáveis.

## Link publicado

```text
https://pabloudimg.github.io/App-Recompensas/
```

## Cenário atual do projeto

A versão atual contempla:

- login com Google via Firebase Authentication;
- criação de conta/família no primeiro acesso;
- cadastro de responsáveis por família;
- convites por e-mail para outro responsável entrar na mesma família;
- regras restritivas no Firestore por família e por membro;
- cadastro de crianças com nome, data de nascimento, idade automática, tema visual e foto;
- cadastro de atividades com estrelas, ordem, status ativo e associação por criança;
- cadastro de prêmios com custo em estrelas/moedas;
- seletor visual de emoticons para atividades e prêmios;
- marcação diária por criança;
- resumo semanal com saldo, prêmios resgatados e transferência de moedas;
- modo claro/escuro;
- layout responsivo com foco em uso mobile;
- backup local em `localStorage` e sincronização em nuvem no Firestore.

## Fluxo principal

1. O usuário entra com Google.
2. O app verifica se existe `userProfiles/{uid}`.
3. Se não houver família válida, mostra a tela de criação de família.
4. Ao criar a família, o app cria o documento da família e o primeiro membro `owner`.
5. O app carrega crianças, atividades, prêmios, marcações, resgates e transferências do Firestore.
6. As alterações feitas no app são salvas localmente e sincronizadas com a nuvem.

## Famílias e responsáveis

A estrutura do app foi pensada para que pai, mãe ou outro responsável acessem a mesma base familiar.

Na criação da família, o usuário informa:

- nome da família;
- parentesco do usuário logado.

Depois, em **Cadastros > Convites**, um membro da família pode convidar outro e-mail Google. O convite registra:

- e-mail convidado;
- família vinculada;
- responsável remetente;
- parentesco do convidado;
- status `pendente` ou `aceito`.

Enquanto o convite estiver `pendente`, ele pode ser removido pelo remetente. Depois de aceito, ele não deve ser removido pela tela, pois já foi utilizado para criar vínculo com a família.

## Crianças

Em **Cadastros > Crianças**, é possível cadastrar e editar:

- nome;
- data de nascimento;
- tema/cor;
- foto.

A idade é calculada automaticamente com base na data de nascimento.

### Fotos das crianças

Ao trocar a foto, o app:

1. lê a imagem no navegador;
2. redimensiona a imagem usando `canvas`;
3. limita o maior lado a aproximadamente `520px`;
4. exporta como JPEG em qualidade `0.82`;
5. salva o resultado como base64 no campo `photo` da criança.

Para esta fase, esse modelo é suficiente. Em uma evolução futura, o ideal é mover fotos para Firebase Storage e salvar no Firestore apenas a URL.

## Atividades

Em **Cadastros > Atividades**, é possível configurar:

- ícone por seletor de emoticons;
- descrição;
- estrelas concedidas;
- ordem de exibição;
- crianças associadas;
- status ativo/inativo.

A aba **Dia** exibe somente as atividades ativas associadas à criança selecionada.

## Prêmios

Em **Cadastros > Prêmios**, é possível configurar:

- ícone por seletor de emoticons;
- nome do prêmio;
- custo em estrelas/moedas.

Os custos são limitados entre `0` e `99`.

## Aba Dia

A aba **Dia** substitui a antiga aba Hoje.

Ela abre por padrão na data atual e permite:

- voltar um dia;
- avançar um dia;
- escolher uma data pelo calendário;
- marcar atividades como 👍 OK, 👎 Não OK ou 😐 N/A;
- desmarcar uma opção clicando nela novamente;
- registrar observações do dia.

Regras da pontuação diária:

- 👍 OK soma as estrelas da atividade;
- 👎 Não OK não soma estrelas;
- 😐 N/A remove a atividade da contagem do dia.

## Aba Semana

A aba **Semana** apresenta o resumo semanal da criança selecionada.

O card mostra:

- estrelas obtidas na semana;
- estrelas transferidas de semanas anteriores;
- estrelas utilizadas em prêmios e transferências;
- estrelas disponíveis.

A fórmula do saldo disponível é:

```text
estrelas disponíveis = estrelas obtidas + estrelas transferidas - estrelas utilizadas
```

### Resgate de prêmios

Na semana, o usuário pode marcar prêmios como resgatados. O app só permite o resgate quando existe saldo suficiente.

Se o prêmio for clicado novamente, ele é desmarcado e o saldo volta a ficar disponível.

### Acumular moedas

A opção fixa **Acumular moedas** transfere o saldo disponível da semana atual para a semana seguinte.

Isso evita perder estrelas quando o saldo acumulado ainda não é suficiente para um prêmio maior.

## Armazenamento e banco em nuvem

O app usa Firestore como banco em nuvem e `localStorage` como apoio local.

### Coleções principais

```text
userProfiles/{uid}
families/{familyId}
families/{familyId}/members/{uid}
families/{familyId}/children/{childId}
families/{familyId}/activities/{activityId}
families/{familyId}/rewards/{rewardId}
families/{familyId}/dailyRecords/{date_childId_activityId}
families/{familyId}/dailyNotes/{date_childId}
families/{familyId}/weeklyRedemptions/{weekKey_childId_rewardId}
families/{familyId}/weeklyTransfers/{weekKey_childId}
familyInvites/{inviteId}
```

### Observações de modelagem

- `children` guarda dados cadastrais das crianças e a foto compactada em base64.
- `activities` guarda atividades e a lista `assignedChildIds`, indicando para quais crianças a atividade se aplica.
- `rewards` guarda os prêmios configurados.
- `dailyRecords` guarda uma marcação por data, criança e atividade.
- `dailyNotes` guarda observações por data e criança.
- `weeklyRedemptions` guarda prêmios resgatados por semana e criança.
- `weeklyTransfers` guarda saldo transferido para a semana seguinte.
- `familyInvites` fica fora de `families` para permitir que o convidado encontre convites pelo próprio e-mail antes de ser membro da família.

## Segurança do Firestore

As regras ficam em:

```text
firestore.rules
```

As regras atuais seguem estes princípios:

- cada usuário só acessa o próprio `userProfiles/{uid}`;
- somente membros ou dono acessam os dados da família;
- o primeiro `owner` pode criar o próprio registro de membro ao criar a família;
- membros podem criar e listar convites da própria família;
- o convidado só consegue ler e aceitar convite enviado ao próprio e-mail;
- convites pendentes podem ser removidos por membros da família;
- convites aceitos não são removidos pela tela do app.

Sempre que `firestore.rules` for alterado, é necessário copiar o conteúdo para o Firebase Console e publicar em:

```text
Firestore Database > Rules > Publish
```

## Estrutura do repositório

```text
App-Recompensas/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
├─ scripts/
│  ├─ apply-family-ui.cjs
│  ├─ apply-day-ui.cjs
│  ├─ apply-emoji-picker.cjs
│  └─ fix-login-invites.cjs
├─ src/
│  ├─ cloudStore.js
│  ├─ firebase.js
│  ├─ logoApp.js
│  ├─ main.jsx
│  └─ styles.css
├─ firestore.rules
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.js
└─ README.md
```

### Arquivos principais

- `src/main.jsx`: app React, telas, componentes e regras de interface.
- `src/cloudStore.js`: camada única de Firebase, incluindo autenticação, criação de família, membros, convites, leitura e gravação dos dados familiares no Firestore.
- `src/firebase.js`: configuração do Firebase.
- `src/logoApp.js`: logo compactada em data URI.
- `src/styles.css`: visual, responsividade, animações, dark mode e mobile.
- `firestore.rules`: regras de segurança do Firestore.
- `scripts/*.cjs`: patches de build usados durante a evolução do app.

## Scripts de desenvolvimento

```bash
npm install
npm run dev
```

O script `dev` executa `prepare:ui` antes de iniciar o Vite.

```bash
npm run build
npm run preview
```

O script `build` também executa `prepare:ui` antes do build de produção.

## Publicação no GitHub Pages

O deploy está automatizado por GitHub Actions em:

```text
.github/workflows/deploy.yml
```

Fluxo:

1. push na branch `main`;
2. instalação das dependências;
3. build com Vite;
4. publicação da pasta `dist` no GitHub Pages.

## Tecnologias usadas

- React;
- Vite;
- Firebase Authentication;
- Cloud Firestore;
- GitHub Pages;
- GitHub Actions;
- CSS responsivo sem framework externo.

## Pontos de melhoria futura

- Consolidar os patches de `scripts/` diretamente no código-fonte para simplificar manutenção.
- Migrar fotos das crianças para Firebase Storage.
- Adicionar tela de administração de membros da família.
- Permitir edição do nome da família.
- Adicionar testes automatizados para regras de cálculo semanal.
- Criar logs ou histórico de alterações importantes.
