# Cross-cutting Concepts

<!-- From @lernapps/app-templates 0.3.2 (the generic part and the interactive extension): lernapps update replaces this file except the app sections, between <!-- app: begin … --> and <!-- app: end … -->, which hold the app's own architecture. -->

The concepts every lernapps app implements, whatever its archetype. The extensions add their archetype's concepts
(the explainer's tutor; the interactive app's core and shell, playthroughs, hash routes).

## Generic architecture and extensions

The archetypes stay separate but share their quality goals, so they share this architecture: the generic part defines
the shared runtime and the tooling helpers and what every app keeps, and each archetype's extension in its template
folder adds its runtime and the parts its creator writes, under ids the generic part names (`bb-archetype-runtime`,
`bb-build`, `bb-render`, `bb-shell`, `bb-e2e`, `if-archetype-content`, …), with its interfaces, decisions, risks and
terms. An app's architecture is the generic part followed by its archetype's extension, chapter by chapter; an
interactive app adds its own blocks below its extension's parts in the same way. The building blocks reach two levels,
roots and their parts, so that every interface can be drawn in a view.

```arc42
:::concept
id: concept-archetype-extension
title: Generic architecture plus one extension per archetype
category: structure
:::
```

## Determinism by the seed in the address

Whatever an app draws at random comes from a seed in the address, so the same address gives the same order, task or
round, and a learner, a teacher, a tutor and the tests can open it again: the quiz's order of questions, the
explainer's tasks by their numbers, an interactive core's states. Each extension says how its archetype uses the seed.

```arc42
:::concept
id: concept-determinism
title: Determinism by the seed in the address
category: testing
:::
```

## Readable without JavaScript

Every app has static pages that describe it without JavaScript: links, the language switch and the footer are plain
links, and what needs JavaScript says so in a `<noscript>` note. How much of an app reads without JavaScript depends on
its archetype: for the quiz and the explainer it is a quality goal of their extensions; an interactive app's start
page reads without JavaScript, its app page does not.

```arc42
:::concept
id: concept-readable-without-js
title: Readable without JavaScript
category: accessibility
:::
```

## Languages

Every page exists once per declared language, German at the root and others below `/<language>/`, and an app may
declare only languages its runtime has texts for. Learner texts are language maps in the creator's data or message
files by language, reached through the translator, never strings in code.

```arc42
:::concept
id: concept-languages
title: Languages
category: i18n
:::
```

## Accessibility by default

Pages meet WCAG 2.1 AA and work at 360 px by default; an app that cannot declares its limits in its entry, and only
then would its findings become warnings (not built yet: they are errors for every app today). Feedback goes through
the polite live region and the focus moves with the a11y helpers, and `lernapps check` runs axe and the width check on
the built pages.

```arc42
:::concept
id: concept-accessibility
title: Accessibility by default, deviations declared
category: accessibility
:::
```

## Component rules

An app's own Vue components (the explainer's components, the interactive UI) and the modules they import are checked
on the SFC compiler's output at build and by lint rules: no network, no `eval`, `new Function`, `innerHTML` or
`v-html`, imports only from Vue, the runtime, the storage, i18n and a11y helpers and the app's own files (an
interactive app's also from the libraries in its dependencies, never from a URL), browser globals only once mounted.

```arc42
:::concept
id: concept-component-rules
title: Component rules
category: security
:::
```

## Device storage

What an app remembers goes through the storage wrapper into `localStorage`, under the prefix `lernapps:<app>:`,
because all apps share one origin; every access is wrapped, so blocked or full storage means the app remembers
nothing and keeps working. The quota of 100 kB per app is decided, not built.

```arc42
:::concept
id: concept-device-storage
title: Device storage
category: persistence
:::
```

## Low stimulation (advice)

Advice, not a rule or check: the skills recommend no flashing, calm motion and sound off by default, and say why
(children, attention, seizures); the creator's assistant follows them. Today the skill `lernapps-interactive` gives
this advice. A settings dialog (less motion, sound, pause) is not in scope now (`dec-no-settings`).

```arc42
:::concept
id: concept-low-stimulation
title: Low stimulation (advice)
category: accessibility
:::
```


The interactive archetype's concepts, besides the generic ones.

## Core and shell

The core is the app's logic in pure TypeScript without DOM, its state plain JSON, exported as `start(seed, route)`,
`step(state, input)` and optionally `tick(state, dt)`. The input is typed and extensible: a key, a pointer or touch
action, and other kinds later; the components translate any device input into such inputs (`dec-typed-input`). The
shell keeps the state, feeds it inputs and ticks and hands it to the components, which only show it, so the same core
runs in Node at build and in the browser.

```arc42
:::concept
id: concept-core-and-shell
title: Core and shell
category: structure
:::
```

## Playthroughs

A playthrough is data: a seed, a route and steps of inputs, each with the state (a part of it) or the announcement
expected after them. The build plays it against the core, the end-to-end tests give the same inputs in the browser,
so behaviour is specified once and checked in both places. A step can let n ticks pass after its inputs; in the build
and in the browser no other time passes, so a real-time core is checked deterministically. The core's property tests
over fixed seeds are not built yet.

```arc42
:::concept
id: concept-playthroughs
title: Playthroughs as data
category: testing
:::
```

## Hash routes

Modes and levels are routes declared in `src/app.yaml`, reached as `app/#<id>` from anchor links on the start page and
the app page. The shell starts the core with the route of the address (else the first) and again on every new route,
so an entry's topics can point to a route and `entry-links-resolve` can check it.

```arc42
:::concept
id: concept-hash-routes
title: Hash routes
category: navigation
:::
```

<!-- app: begin -->
<!-- app: end -->
