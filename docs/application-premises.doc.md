# Life Cost — product premises

## Purpose

People usually compare a purchase to its **price today**. This app adds **opportunity cost**: if that money stayed invested instead, how much could it grow over time?

Core message: the sticker price is not the whole story—you are also giving up **future money** that compounding could have produced.

## Model (illustrative)

- **Compound growth** month by month: **FV = P × (1 + r)^n**, where **P** is the amount not spent, **r** is the monthly return as a decimal (e.g. 1% → 0.01), and **n** is the number of months.
- The app uses a **scenario**, not a forecast—e.g. “if this monthly return held…” Rates are **not** entered on the main flow; they live in **[js/config.js](../js/config.js)** (monthly return %, annual inflation % for consistency with the product model, illustrative monthly income, life expectancy, hours-per-month for the hourly estimate).
- **Inflation** in config supports a single source of truth for the scenario; the **main result screen** currently highlights **nominal future value** and **estimated life hours** (hourly rate from config income ÷ configured hours per month). A future UI could surface purchasing-power (real) again without changing the core formulas in **finance.js**.
- **Depreciation** of the good (car, house, etc.) is **out of scope for v1**—too many variables.

## What the user sees (main calculator)

- **Step 1**: **Age** and **price of the good** (BRL), then **Calcular**.
- **Step 2**: **Illustrative future value** (nominal, in BRL) and **estimated hours of life** (based on the configured illustrative income and hours-per-month rule), plus **Nova simulação** to return to step 1.
- **Footer disclaimer**: educational only, not financial advice; real returns, taxes, and personal situations differ—users should not treat the output as certain.

## Out of the main UI (current version)

The following were part of an earlier, denser layout and are **not** on the default two-step flow today: live recalculation on every keystroke, good picker on the home form, user-editable return/inflation/income, nominal vs real as separate headline blocks, growth beyond principal, doubling time, milestones, salary-months line, growth chart, advanced horizon override. Some of these could return as optional or secondary screens later.

## Catalog

- **Goods page**: images plus name, description, and reference price; links to the home calculator with **`?good=`** so the price field can be prefilled (no catalog dropdown on the home form).
- **Data**: one file (e.g. JSON) driving the list; optional reference date on the data or in the UI. Keep versioning simple.

## User inputs (main calculator)

- **Age**
- **Price of the good** (typed; optional prefill via **`?good=`** from the catalog page)

## Scenario parameters (not user inputs on the main flow)

- **Monthly return (%)**, **annual inflation (%)**, **illustrative monthly income (BRL)**, **life expectancy (years)**, **hours per month** for the hourly estimate — all in **js/config.js** for the site maintainer to adjust.

## Horizon

- Default horizon in years: **life expectancy − age**, with a **minimum of 5 years** when that difference is smaller—so people very close to the average life expectancy still get a meaningful projection.
- No manual horizon override in the current UI; could be added later (config or advanced panel).

## App shape

- **Static site**: HTML, CSS, and JavaScript—**no backend** for v1; calculations in **pure functions** where possible (**finance.js**).
- **Mobile-first**, simple flows, modern layout.
- **Hosting**: compatible with **GitHub Pages** (relative asset paths).

## Out of scope (v1)

- Vehicle total cost of ownership, depreciation models, or live Selic/API feeds.
- Gender- or cohort-specific life tables; one illustrative expectancy in config is enough for this version.
- Multiple simultaneous scenarios (low/base/high bands)—possible later, not required now.
