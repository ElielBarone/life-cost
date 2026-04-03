# Life Cost

Simulador estático de **custo de oportunidade**: quanto um valor poderia crescer em um cenário de retorno mensal ilustrativo, com estimativa de poder de compra e tempo de trabalho.

## Requisitos

- Navegador moderno.
- Para desenvolvimento local, um servidor HTTP simples (o catálogo é carregado com `fetch`; abrir `index.html` direto do disco costuma falhar por política do navegador).

## Rodar localmente

Na pasta do projeto:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080/index.html`.

Alternativa:

```bash
npx --yes serve .
```

## Testes (cálculos)

```bash
npm test
```

## GitHub Pages

1. Crie um repositório e envie estes arquivos (raiz do site = raiz do repositório, ou ajuste conforme a pasta escolhida no Pages).
2. Em **Settings → Pages**, publique a branch principal com pasta **`/` (root)**.
3. Se o site ficar em `https://<usuario>.github.io/<repositorio>/`, os caminhos relativos (`./css/`, `./js/`, `./assets/`) já funcionam a partir de `index.html` e `goods.html`.

Não é necessário build: apenas HTML, CSS e JS.

## Estrutura

- `index.html` — simulador principal.
- `goods.html` — lista de bens de exemplo (`assets/data/goods.json`).
- `js/finance.js` — funções puras de cálculo.
- `js/app.js` — interface do simulador e gráfico SVG.
- `js/catalog.js` / `js/goods-page.js` — catálogo.

## Aviso

Ferramenta educativa; não é recomendação de investimento.
