---
name: Drawing Office
description: A job portal built as a drawing office — title blocks, revision tables, line weights, and an orange markup pass.
colors:
  paper: "#F1F3F5"
  sheet: "#FFFFFF"
  ink: "#0B0B0C"
  ink-2: "#3B3F45"
  ink-3: "#6A7078"
  rule: "#C9CDD2"
  rule-soft: "#E3E6E9"
  markup: "#EA580C"
  markup-ink: "#9A3412"
  markup-wash: "#FFF2E8"
  approved: "#1F6F3D"
  approved-wash: "#EAF5EE"
  void: "#0B0B0C"
typography:
  lettering:
    fontFamily: "var(--font-archivo-narrow), 'Arial Narrow', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.12em"
  display:
    fontFamily: "var(--font-archivo-narrow), 'Arial Narrow', sans-serif"
    fontSize: "clamp(2rem, 6vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "var(--font-archivo-narrow), 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-archivo), system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  data:
    fontFamily: "var(--font-archivo), system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  search:
    fontFamily: "var(--font-archivo), system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  mark:
    fontFamily: "var(--font-archivo), system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  none: "0px"
  chip: "2px"
spacing:
  hair: "4px"
  tight: "8px"
  cell: "12px"
  block: "24px"
  sheet: "40px"
components:
  button-primary:
    backgroundColor: "{colors.markup}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.markup-ink}"
    textColor: "{colors.sheet}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "10px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  sheet-panel:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.block}"
  input-field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "9px 12px"
---

# Design System: Drawing Office

## Overview

The portal is a drawing office. A job listing is a **drawing sheet** with a
title block. An application's status history is a **revision table** — the
oldest convention in drafting for an append-only, dated, signed record, and
exactly what `ApplicationEvent` already is in the database.

The world is chosen from the product's one real promise: an application here
never disappears into silence. Drafting is the visual language of things that
are recorded, numbered, checked, and never quietly overwritten.

**Ink on film, marked up in orange.** Black linework on a cool drafting-film
ground; orange is the markup pass — the redline, the revision cloud, the
highlighter over a print. Orange never decorates. It marks what changed, what
is current, and what to do next.

Mode is **Operate** on every working surface (search, dashboards, forms,
applicants) and **Persuade** on the landing page only. Expression never
obscures the task.

## Colors

### Primary

`markup` `#EA580C` — the markup pass. Primary actions, the current pipeline
stage, active navigation, revision marks. Use `markup-ink` `#9A3412` for orange
*text* at body size (7.4:1 on sheet); `markup` itself is for fills and large
lettering only (3.6:1 — never small text on light).

`markup-wash` `#FFF2E8` — a pale orange field for the active row or current
stage. The revision cloud's fill.

### Neutral

`paper` `#F1F3F5` — the page ground. A cool drafting film, deliberately not a
warm cream.
`sheet` `#FFFFFF` — a drawing sheet laid on the film. All panels.
`ink` `#0B0B0C` — the drafting pen. Body text, heavy rules, headings.
`ink-2` `#3B3F45` — secondary prose. `ink-3` `#6A7078` — labels and metadata
(4.9:1 on sheet).
`rule` `#C9CDD2` — hairline rules. `rule-soft` `#E3E6E9` — table separators.

### Tertiary

`approved` `#1F6F3D` and `approved-wash` `#EAF5EE` — the approval stamp. Hired,
published, verified. The only colour outside the black/orange system, and it
appears only on genuine approval states.

`void` `#0B0B0C` — black used as a *ground* (site header, landing statement
plane, title-block bars). On black, `markup` is 5.9:1 and safe for text.

### Named Rules

- **Orange marks; it does not decorate.** If an orange element does not
  indicate a current state, a primary action, or a change, remove it.
- **Black text on orange, never white.** `ink` on `markup` is 5.8:1; white on
  `markup` is 3.6:1 and fails at button size.
- **No colour outside these roles.** Errors reuse `markup-ink`; there is no
  separate red. A drawing office marks in one colour.

## Typography

Two cuts of one family. **Archivo Narrow** is the drafting lettering: narrow,
even-stroked, set in caps with wide tracking, used for every label, title-block
cell, table header, and heading. **Archivo** is the body face, used for
anything a person reads in sentences.

Neither is a costume. Drafting lettering is genuinely narrow and monoline;
Archivo Narrow is the closest workhorse to a lettering stencil.

### Hierarchy

- `display` — the landing statement and page titles. Archivo Narrow 700,
  `clamp(2rem, 6vw, 3.75rem)`, tracking `-0.02em`, line-height 0.95.
- `heading` — section and sheet titles. Archivo Narrow 700, up to 1.75rem.
- `lettering` — **the system's signature.** Archivo Narrow 600, 0.6875rem,
  `text-transform: uppercase`, tracking `0.12em`. Every field label, column
  header, and title-block key.
- `body` — Archivo 400, 0.9375rem, line-height 1.6. Job descriptions cap at
  **68ch**.
- `data` — Archivo 500, 0.8125rem with `font-variant-numeric: tabular-nums`.
  All dates, reference numbers, salaries, counts, and revision rows.
- `search` — Archivo 400, 1.0625rem. **One use only:** the landing page's
  primary search entry, where the field is the page's main action and needs to
  sit above body size. Not a general "large text" step.
- `mark` — Archivo 700, 0.625rem. **One use only:** the letter inside a
  revision triangle, which is a drafting mark rather than text and has to fit
  inside a 24px glyph.

### Named Rules

- **Tabular numerals everywhere numbers align.** Revision tables, sheet
  numbers, salaries, dates. Drafting numerals sit in columns.
- **Caps and tracking are for labels only.** Never set a sentence in the
  lettering style — it is a label system, not an emphasis tool.

## Layout

**The drawing frame** wraps every route (`DrawingFrame` in `components/ui.tsx`):
a 2px inset border with zone references — `1`–`6` along the top and bottom,
`A`–`D` down both sides. A technical drawing is identifiable across a room by
this frame, and it is what makes thirteen different routes read as one drawing
set rather than as a series of white panels. Below 640px it collapses away
entirely, because zone markers on a phone eat reading width for nothing. The
markers are `aria-hidden` — they are draughtsman's furniture, not content.

A **title block** opens every significant surface: a bordered strip of labelled
cells (`REF` / `ISSUED` / `STATUS` / `SHEET`) separated by hairline rules, with
the sheet's real subject set large beside or beneath it.

- Content column max `1200px`; reading measure max `68ch`.
- Spacing scale: 4 / 8 / 12 / 24 / 40. More space above a heading than below.
- Listings are a **register**: a single-column stack of sheets separated by
  hairline rules, not a grid of equal cards.
- Responsive: title-block cells stack to two columns under 640px and the sheet
  border drops to left/right hairlines only. Filters collapse to a single
  scrolling row. Tables reflow to labelled rows — never a horizontal scrollbar
  on a phone.

## Elevation & Depth

**There are no drop shadows in this system.** A drawing office works on flat
sheets; depth comes from line weight, exactly as it does on a real drawing.

Line-weight hierarchy, the core structural device:

- `hairline` — 1px `rule`. Dimension lines, table separators, cell divisions.
- `medium` — 1px `ink-3`. Section divisions.
- `outline` — 2px `ink`. Sheet borders, the title block, the active element.

Emphasis is a heavier line, never a softer shadow. The one permitted lift is
the `markup-wash` fill on a current row.

## Shapes

**Square.** `border-radius: 0` on sheets, panels, buttons, inputs, and
navigation. Drafting has no rounded corners. The single exception is `chip`
(2px) on small status stamps, which reads as a stamped edge rather than a pill.

Never `rounded-full`. A pill contradicts the entire world.

## Components

### Buttons

Primary: solid `markup`, `ink` text, square, lettering style in caps. Hover
deepens to `markup-ink` with `sheet` text. Secondary: `sheet` ground, 1px `ink`
border, `ink` text. Danger reuses `markup-ink` as a 1px border with
`markup-ink` text — no separate red.

Focus: 2px `ink` outline with 2px offset. Visible on every interactive element.

### Chips (status stamps)

A stamp is `lettering` in caps on a 1px border with a wash fill, 2px radius.
Current stage: `markup` border on `markup-wash`. Approved states: `approved` on
`approved-wash`. Neutral and closed states: `rule` border on `paper` with
`ink-3` text.

### Cards / Containers

There are no cards. There are **sheets**: `sheet` ground, 1px `rule` border,
square, no shadow. A sheet may carry a title-block strip along its top edge.
Nested sheets are forbidden — use a hairline rule to divide within one sheet.

### Drafting notation

Three marks from the world's own vocabulary, each carrying a real state rather
than decorating:

- **`.hatched`** — 45° hatching at 7% ink. The drafting notation for cut, void,
  or superseded. Used as the fill for closed listings and closed-state stamps,
  so "this is finished" has a native mark instead of only grey text.
- **`.rev-triangle`** — the lettered triangle that flags a revision at the
  changed item. Carries the `A` / `B` / `C` in every revision table. The current
  revision's triangle is filled `markup`; earlier ones are neutral.
- **The revision cloud fill** — `markup-wash` behind the current row, with the
  2px `markup` left edge. This is the one coloured edge the system permits,
  because it is the revision mark itself.

### Tables (revision tables)

Column headers in `lettering` caps over a 2px `ink` rule. Rows separated by
`rule-soft` hairlines. Data cells use `data` with tabular numerals. The current
row carries a `markup-wash` fill and a 2px `markup` left edge — the only place
a coloured edge is permitted, because it is the revision mark itself.

## Do's and Don'ts

**Do**

- Open surfaces with a title block; it is the system's recognisable device.
- Render every status history as a revision table with real dates and actors.
- Use line weight for hierarchy and emphasis.
- Set labels in tracked caps and data in tabular numerals.
- Keep motion to one authored moment: a status change draws its markup rule in
  (`scaleX` from 0, 200ms, ease-out) and the stamp settles. Everything else is
  a 120–160ms ease-out on hover and focus. No scroll-triggered entrances.
  All motion respects `prefers-reduced-motion`.

**Don't**

- No drop shadows, no glass, no blur, no gradient text, no glow. Black plus a
  glowing orange accent is the generic dark-theme cliché this world exists to
  avoid — and this system is light-ground for exactly that reason.
- No rounded corners beyond the 2px stamp edge, and never a pill.
- No equal-card grids as page structure.
- No orange that does not mark a state, an action, or a change.
- No monospace. Drafting lettering is not monospaced, and mono here would be a
  costume for "technical" rather than a real measurement face — tabular
  numerals in Archivo do that job honestly.
- No uppercase eyebrow above every section. The title block is the system;
  a decorative kicker on top of it is grammar nobody chose.
