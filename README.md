# Missões da Semana

Mini app familiar para marcar atividades diárias da Malu e do Miguel, acompanhar estrelas durante a semana e combinar bonificações no fim de semana.

## O que esta primeira versão faz

- Perfis iniciais: Malu e Miguel.
- Atividades editáveis.
- Marcação diária: OK, Não OK ou N/A.
- Pontuação por atividade.
- Resumo semanal com percentual e estrelas.
- Recompensas editáveis.
- Backup/exportação em JSON.
- Importação de backup em outro navegador/dispositivo.
- Armazenamento local pelo `localStorage`.

## Limite importante da versão 1

Os dados ficam salvos apenas no navegador em que o app foi usado. Para usar em outro celular/computador, exporte o backup em JSON e importe no outro dispositivo.

A versão 2 pode evoluir para Firebase ou Supabase, com login e dados na nuvem.

## Como rodar localmente

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

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie estes arquivos para a branch `main`.
3. No GitHub, acesse `Settings` > `Pages`.
4. Em `Build and deployment`, selecione `GitHub Actions`.
5. Faça um push para a branch `main`.
6. O workflow `.github/workflows/deploy.yml` fará o build e publicará o app.

## Ideias para a versão 2

- Login dos pais.
- Sincronização entre dispositivos.
- Histórico mensal.
- Regras por criança.
- Atividades por dia da semana.
- Loja de recompensas com resgate.
- Área infantil somente para visualização.
- Relatórios simples para conversar com as crianças no domingo.
