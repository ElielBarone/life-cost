# Documentação do Sistema de Design: Experiência Financeira Premium

## 1. Overview & Creative North Star: "The Financial Architect"

Este sistema de design afasta-se das interfaces financeiras genéricas e "flat" para abraçar uma estética que chamamos de **The Financial Architect**. O objetivo é transmitir autoridade, precisão técnica e sofisticação editorial. 

Diferente de aplicativos bancários tradicionais que utilizam grids rígidos e simétricos, este sistema utiliza a **Assimetria Intencional** e o **Escalonamento Editorial** para guiar o olhar. Imagine uma revista de alto padrão cruzada com um terminal de dados de última geração. A interface deve parecer construída, não apenas renderizada, utilizando camadas de profundidade tonal e tipografia que respira.

---

## 2. Cores e Tonalidade

O sistema utiliza uma paleta de "Deep Charcoal" enriquecida por um acento vibrante de ciano/esmeralda. A profundidade não é alcançada com preto puro, mas com camadas de cinzas quentes e frios que simulam materiais físicos.

### A Regra "No-Line"
**Proibimos o uso de bordas sólidas de 1px para separar seções.** A estrutura da interface deve ser definida exclusivamente através de:
- **Background Color Shifts:** Transições sutis entre `surface` e `surface-container-low`.
- **Tonal Transitions:** Uso de variações de luminância para indicar onde termina um grupo de informações e começa outro.

### Hierarquia de Superfícies (Surface Nesting)
Trate a UI como camadas de vidro fumê sobrepostas.
- **Base:** `surface` (#131313)
- **Painéis de Conteúdo:** `surface-container-low` (#1C1B1B)
- **Elementos em Destaque/Cards:** `surface-container-high` (#2A2A2A)
- **Modais/Floating Elements:** `surface-bright` (#393939) com efeito Glassmorphism.

### Glass & Gradient (A Alma Visual)
Para CTAs principais (como o botão "Calcular"), não use apenas uma cor sólida. Aplique um gradiente sutil de `primary_container` (#00FFCC) para `primary_fixed_dim` (#00E0B3) em um ângulo de 135°. Isso remove o aspecto "plástico" e confere um brilho metálico premium.

---

## 3. Tipografia

A tipografia é o alicerce da confiança. Combinamos a precisão técnica da **Inter** com a personalidade moderna da **Manrope**.

- **Display & Headlines (Manrope):** Utilizadas para números grandes, títulos de cenários e chamadas principais. O kerning deve ser levemente reduzido (-2%) para um look mais denso e autoritário.
- **Body & Labels (Inter):** Focada em legibilidade máxima. Para dados financeiros secundários, utilize `label-md` com `on_surface_variant` (#B9CBC2) para criar um contraste de informação "mudo".

A hierarquia deve ser drástica: um `display-lg` para o valor total da vida útil deve contrastar fortemente com um `label-sm` para notas de rodapé, criando um ritmo visual dinâmico.

---

## 4. Elevação & Profundidade

### O Princípio de Empilhamento
A profundidade é alcançada pelo "stacking" de tokens. Um card de `surface-container-highest` deve ser posicionado sobre uma área de `surface-container-low`. Isso cria um "lift" natural e suave que não cansa a vista do usuário em ambientes escuros.

### Sombras Ambientais (Ambient Shadows)
Quando um elemento precisa flutuar (ex: Tooltips ou Modais), utilize sombras extra-difundidas:
- **Blur:** 24px a 40px.
- **Opacidade:** 4% a 8%.
- **Cor:** Use uma versão matizada do `on_surface` em vez de preto puro, simulando a dispersão da luz no ambiente escuro.

### O Fallback "Ghost Border"
Se uma borda for indispensável para acessibilidade em inputs, use o token `outline_variant` (#3A4A44) com **20% de opacidade**. Nunca utilize bordas 100% opacas, pois elas interrompem a fluidez do design editorial.

---

## 5. Componentes

### Buttons (Botões)
- **Primary:** Gradiente de `primary_container` para `primary_fixed_dim`. Texto em `on_primary` (#00382B) com peso semi-bold. Raio de 12px.
- **Secondary:** Sem preenchimento, apenas a "Ghost Border" e texto em `primary_fixed`.
- **States:** No estado *Hover*, o componente deve ganhar um brilho interno (inner glow) sutil, nunca apenas uma mudança de cor chapada.

### Input Fields (Campos de Entrada)
- **Style:** Background em `surface_container_highest`. A borda de foco deve usar o token `surface_tint` (#00E0B3) com um efeito de *outer glow* neon suave (blur de 8px).
- **Labels:** Sempre em `label-md` flutuando acima do campo, nunca dentro como placeholder, para manter a clareza dos dados.

### Cards & Seleção de Exemplos
- **Layout:** Imagens (como os carros no app) devem ter bordas arredondadas de 8px e estar contidas em um frame `surface-container-low`.
- **Forbid Dividers:** É proibido o uso de linhas divisórias entre itens de lista. Use o escalonamento de `0.75rem` a `1.5rem` de espaço em branco para separar contextos.

### Progress & Data Viz
- Use o `primary` (#FDFFFC) para linhas de tendência e `primary_container` para pontos de dados de destaque. O contraste entre o branco puro e o ciano cria um foco imediato no que é importante.

---

## 6. Do's and Don'ts

### Do (Fazer)
- **Use Hierarquia de Cores:** Utilize `on_surface_variant` para textos secundários e `on_surface` para informações críticas.
- **Respire:** Deixe margens generosas (mínimo 24px) nas bordas da tela para reforçar o visual editorial.
- **Interação:** Utilize transições suaves (200ms, ease-out) para qualquer mudança de estado de hover ou foco.

### Don't (Não Fazer)
- **Evite o Contraste Excessivo:** Não use branco puro (#FFFFFF) para grandes blocos de texto; prefira o `on_surface` (#E5E2E1) para reduzir a fadiga ocular no tema escuro.
- **Diga Não às Linhas:** Não use divisores horizontais para separar cards ou itens de lista. O contraste entre superfícies é seu melhor amigo.
- **Sem Bordas Rígidas:** Nunca use `outline` puro em 100% de opacidade, a menos que seja um estado de erro crítico (`error`).