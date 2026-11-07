# Glossary

<!-- From @lernapps/app-templates 0.3.2 (the generic part and the interactive extension): lernapps update replaces this file except the app sections, between <!-- app: begin … --> and <!-- app: end … -->, which hold the app's own architecture. -->

<!--
Arc42 chapter 12. Define the domain and technical terms used in the architecture documentation.
A shared glossary reduces misunderstanding by ensuring all stakeholders use the same language.
If you work in multi-language teams, it also serves as a translation reference.

For each term, write a ## section with a prose paragraph providing context, etymology, or
extended explanation where useful, followed by a DSL block with a concise definition.

Keep the `definition` field to one or two sentences that unambiguously identify the concept.
Extended explanation belongs in the prose above the block.

If a short form is important, include it in the prose; the typed glossary block has no
`abbreviation` field.

Note synonyms the team has agreed NOT to use, and why, in the prose paragraph.

See https://docs.arc42.org/section-12/ for further guidance.

Example:

## Bounded Context

A bounded context is a logical boundary within which a domain model is consistent and
unambiguous. Inside a bounded context, terms have precise, agreed meanings. The same word
may mean something different in another bounded context.

```arc42
:::glossary-term
id: term-bounded-context
title: Bounded Context
definition: A logical boundary within which a domain model, its language, and its rules are internally consistent. Defined in Domain-Driven Design (Evans, 2003).
:::
```
-->

Terms with a meaning specific to lernapps apps of every archetype. Learner-facing text is German; these terms are the
English names used in code, schemas and this architecture. Each extension adds its archetype's terms.

## Archetype

One of the kinds of app the generator can make, each a template folder of `lernapps/app-templates` with its runtime:
`quiz`, `explainer`, `interactive`.

```arc42
:::glossary-term
id: term-archetype
title: Archetype
definition: A kind of lernapps app (quiz, explainer, interactive) with its template and its runtime, which fixes what the creator writes.
:::
```

## Extension

Lives in the template folder's `docs/arc42/`; it references the generic ids and defines none of them again.

```arc42
:::glossary-term
id: term-extension
title: Extension
definition: The part of the architecture one archetype adds to the generic architecture, its blocks placed below the generic ones.
:::
```

## Runtime

The runtime of `@lernapps/app-templates`; together with the tooling helpers it forms the frame an app does not change.

```arc42
:::glossary-term
id: term-runtime
title: Runtime
definition: The shared code of every app of an archetype that builds its pages, checks it at build time and runs it in the browser; the app never edits it.
:::
```

## Shell

Started by the archetype's start function in `src/main.ts`: `startQuiz`, `startExplainer` or `startInteractive`.

```arc42
:::glossary-term
id: term-shell
title: Shell
definition: The runtime's code in the browser that turns the static pages into the live app.
:::
```

## Creator

The person who makes and lists an app on lernapps.net, usually working through an AI assistant.

```arc42
:::glossary-term
id: term-creator
title: Creator
definition: The person who builds an app and lists it in the app overview.
:::
```

## Start Page

`index.html` of each language. Not to be confused with the home page of lernapps.net.

```arc42
:::glossary-term
id: term-start-page
title: Start page
definition: The page at the app's address, rendered at build from what the creator wrote, from which every other page of the app is reached.
:::
```

## Seed

Taken from the address where the archetype uses one, else drawn at random.

```arc42
:::glossary-term
id: term-seed
title: Seed
definition: A positive integer from which the app draws everything random, so that the same address gives the same order, task or states.
:::
```

## Entry

The only way an app connects to the platform: its entry links to it. Its topics may point to the app's deep links, an
app that deviates from the accessibility default says so there, and its fact sheet states the app's size (not built
yet).

```arc42
:::glossary-term
id: term-entry
title: Entry
definition: The one YAML file per app in lernapps/apps entries/, checked against the entry schema, that lists the app in the app overview.
:::
```

## Catalog

Shown at lernapps.net/apps/; the owner decides whether an app is listed.

```arc42
:::glossary-term
id: term-catalog
title: Catalog
definition: The apps the app overview of lernapps.net provides, one entry per app.
:::
```

## Tutor

Optional; built for the explainer only; no model runs in the browser (see `dec-tutor-variant`).

```arc42
:::glossary-term
id: term-tutor
title: Tutor
definition: The learner's own AI assistant, to which the app hands the current task after a click, through a prompt and static tutor pages.
:::
```


The interactive archetype's terms, besides the generic ones.

## Core

The app's logic in `src/core/index.ts`. Called "core" rather than "engine" or "model" because it holds no state of its
own: the shell keeps it.

```arc42
:::glossary-term
id: term-core
title: Core
definition: The app's logic, pure TypeScript without DOM, exporting start(seed, route), step(state, input) and optionally tick(state, dt); deterministic by its seed, its state plain JSON.
:::
```

## App Page

The one page on which the app runs; without JavaScript it shows only a note and a link back to the start page.

```arc42
:::glossary-term
id: term-app-page
title: App page
definition: The page that loads the app's client module, into whose element the shell mounts the app.
:::
```

## Route

A mode or level of the app, declared in `src/app.yaml`. The core receives the route's id in `start`.

```arc42
:::glossary-term
id: term-route
title: Route
definition: A mode or level of the app with its own address on the app page (app/#<id>); the first route when the address names none.
:::
```

## Tick

The runtime's constant `TICK` is 20. A learner's browser ticks in real time; the build and the end-to-end tests tick
only as a playthrough step's `ticks` say.

```arc42
:::glossary-term
id: term-tick
title: Tick
definition: A call of tick(state, 20) that the shell makes every 20 ms when the core has tick, so the state moves with time.
:::
```

## Playthrough

A YAML file in `src/playthroughs/`. Not a free-form test: it holds only data the runtime plays.

```arc42
:::glossary-term
id: term-playthrough
title: Playthrough
definition: A seed, a route and a list of steps, each inputs (keys as their short form) and ticks followed by the state (a part of it) or the announcement expected after them; played by the build against the core and by the browser test.
:::
```

## Input

What the core's `step` takes: a key input or an action input (`dec-typed-input`).

```arc42
:::glossary-term
id: term-input
title: Input
definition: A typed, extensible value the core's step takes: a key as the browser names it, a pointer or touch action, and other kinds later; the components translate any device input into inputs, and playthroughs record them.
:::
```

<!-- app: begin -->
<!-- app: end -->
