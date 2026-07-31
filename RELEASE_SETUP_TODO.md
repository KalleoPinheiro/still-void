# TODO — colocar o pipeline de release automático no ar

Este documento existe só até a checklist estar completa (é seguro apagá-lo depois do
primeiro release automatizado bem-sucedido). O pipeline em si (workflows, `lint:package`,
política de bump) já está implementado e mergeado — o que falta é configuração do
repositório que só um humano com acesso de admin pode fazer, mais a validação em produção
do primeiro ciclo real.

## 1. Segredos e permissões do repositório (bloqueante — nada publica sem isso)

- [ ] **Criar o token `NPM_TOKEN`**
  - npm descontinuou os tokens clássicos (incluindo o antigo tipo "Automation") em
    dezembro de 2025 — hoje só existem **granular access tokens**.
  - No [npmjs.com](https://www.npmjs.com) → *Access Tokens* → **Generate New Token** →
    **Granular Access Token**:
    - Packages and scopes: restringir a `@still-void/ui` (ou ao escopo `@still-void`),
      permissão **Read and write**.
    - Marcar **Bypass 2FA** — sem isso o `npm publish` do CI para pedir confirmação
      interativa.
    - Definir uma expiração (máximo permitido: 90 dias) e agendar a rotação antes de
      vencer — um `NPM_TOKEN` expirado quebra o publish silenciosamente até alguém notar.
  - GitHub → repositório → **Settings → Secrets and variables → Actions → New repository
    secret** → nome `NPM_TOKEN`, valor o token gerado.
  - *(Alternativa mais robusta, sem token para rotacionar)*: migrar para
    [OIDC trusted publishing](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow/),
    que o npm recomenda como sucessor dos tokens de longa duração. Fica de fora do escopo
    deste PR — os workflows já concedem `id-token: write` onde seria necessário, mas a
    migração do passo de publish para OIDC é um trabalho à parte.
- [ ] **Permitir que Actions abra PRs**
  - GitHub → **Settings → Actions → General → Workflow permissions** → marcar
    *"Allow GitHub Actions to create and approve pull requests"* → Save.
  - Sem isso, `changesets/action` falha silenciosamente ao tentar abrir o PR
    "chore: version packages".
- [ ] **Habilitar GitHub Pages via Actions**
  - GitHub → **Settings → Pages → Build and deployment → Source** → selecionar
    **GitHub Actions**.
  - Sem isso, o job `storybook` do `release.yml` falha no passo `deploy-pages`.
- [ ] *(Opcional, recomendado)* **Branch protection na `main`**
  - Settings → Branches → Add rule → `main` → exigir o check `test` (CI) verde antes do
    merge. Evita que um PR quebrado chegue à `main` e dispare o `release.yml`.

## 2. Ancorar o histórico de tags

O npm já tem `1.0.0` e `1.1.0` publicados, mas o repositório não tem nenhuma tag git —
sem isso a primeira tag que a automação criar (`v1.1.1` ou o que vier a seguir) fica sem
uma `v1.1.0` anterior para comparar.

- [ ] Rodar, com um checkout limpo de `main` já atualizado:
  ```sh
  git fetch origin main
  git tag v1.1.0 $(git rev-parse origin/main)   # de6dff3 no momento em que este doc foi escrito
  git push origin v1.1.0
  ```

## 3. Merge do PR de automação

- [x] Branch `claude/design-system-versioning-automation-udqzxk` implementada e enviada.
- [ ] Abrir o PR contra `main` (feito por este agente nesta sessão — ver link no chat).
- [ ] Aguardar o CI (`test` + `changeset`) ficar verde.
- [ ] Resolver comentários de review (CodeRabbit ou humano), se houver.
- [ ] Merge.

## 4. Primeiro ciclo real de release (validação end-to-end)

Este próprio PR carrega um changeset (`.changeset/rotten-doors-repeat.md`, para o fix do
`exports` map), então `release.yml` já encontra algo pendente no primeiro push a `main` —
não é preciso criar uma mudança à parte para disparar o primeiro ciclo.

- [ ] Depois do merge deste PR, confirmar que `release.yml` abre o PR
      **"chore: version packages"** automaticamente, com `CHANGELOG.md`, `package.json`
      e `package-lock.json` atualizados.
- [ ] Revisar o changelog gerado — é a última chance de ler antes de ficar público.
- [ ] Merge do PR de versão → confirmar:
  - [ ] Pacote publicado em [npmjs.com/package/@still-void/ui](https://www.npmjs.com/package/@still-void/ui)
        com o badge **Provenance**.
  - [ ] Tag `vX.Y.Z` criada e enviada.
  - [ ] GitHub Release criado com as notas certas.
  - [ ] Job `storybook` do `release.yml` disparou e o Storybook está acessível em
        `https://kalleopinheiro.github.io/still-void/` (ou a URL que o Pages atribuir —
        conferir em Settings → Pages após o primeiro deploy).

## 5. Teste do canário (opcional, mas recomendado uma vez)

- [ ] Abrir qualquer PR de teste, adicionar a label **`canary`**.
- [ ] Confirmar que `snapshot.yml` publica `0.0.0-canary-<timestamp>` na dist-tag
      `canary` e comenta o comando de instalação no PR.
- [ ] `npm install @still-void/ui@canary` em um projeto de teste e confirmar que instala.

## 6. Limpeza

- [ ] Depois que os itens 1–5 estiverem confirmados em produção, apagar este arquivo
      (`RELEASE_SETUP_TODO.md`) em um PR pequeno — a partir daí `CONTRIBUTING.md` é a
      única referência que precisa existir.
