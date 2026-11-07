# Quality Requirements

<!-- From @lernapps/app-templates 0.3.2 (the generic part and the interactive extension): lernapps update replaces this file except the app sections, between <!-- app: begin … --> and <!-- app: end … -->, which hold the app's own architecture. -->

```arc42
:::ignore W006 two high-priority goals is the owner's decision (2026-10-16): privacy and checkable high; the interactive archetype adds no goal of its own
:::
```

The four quality goals every lernapps app shares, in the order of chapter 1, each made testable by scenarios. The
set and the priorities are the owner's (2026-10-16). Each extension adds its archetype's scenarios; the quiz and the
explainer add readability without JavaScript as a goal of their own. Scenarios marked "not built yet" describe a
decided check that does not exist today.

## 10.1 Quality Goals

## Privacy

The app sends nothing anywhere and requests nothing from another server before a click; what it remembers stays on the
learner's device. The privacy notice of lernapps.net promises this for every app.

```arc42
:::quality-goal
id: qg-privacy
title: Privacy
priority: high
:::
```

## Checkable

The rules an app keeps are verified by machine, at build and in the browser, so that an assistant can change content
or code and still learn at once when it breaks the frame.

```arc42
:::quality-goal
id: qg-checkable
title: Checkable by machine
priority: high
:::
```

## Accessibility

A default with declared limits: the pages meet WCAG 2.1 AA and work at 360 px, and an app that cannot declares its
limits in its entry.

```arc42
:::quality-goal
id: qg-accessibility
title: Accessibility by default
priority: medium
:::
```

## Understandable

A reviewer or the creator's agent understands an app's structure from its architecture, the generic part plus its
archetype's extension, written in English and minimal and kept current with the code.

```arc42
:::quality-goal
id: qg-understandable
title: Understandable from its architecture
priority: medium
:::
```

## 10.2 Quality Scenarios

## No request before a click

`lernapps check` visits every page of the built app, blocks and records requests to other hosts while it loads.

```arc42
:::quality-scenario
id: qs-no-request-before-click
title: No request to another host before a click
quality: qg-privacy
stimulus: lernapps check loads every page of the built app without clicking
response: Requests to other hosts are recorded; each one is an error of no-request-before-click
metric: 0 requests to another origin on every page before a click
:::
```

## State stays on the device

An app's code that uses the browser's storage directly, sets a cookie or calls a network API is reported by the lint
rules on commit and by the component rules at build.

```arc42
:::quality-scenario
id: qs-state-on-device
title: Remembered state stays on the device
quality: qg-privacy
stimulus: A component stores progress with localStorage directly or sends it with fetch
response: storage-through-wrapper or vue-component-no-network reports it; the build's component rules fail on the network call
metric: 0 findings; all storage goes through createStorage under the prefix lernapps:<app>:
:::
```

## Broken content fails the build

What the creator wrote is validated against the archetype's schema or contract before any page is written.

```arc42
:::quality-scenario
id: qs-build-fails-per-line
title: A broken question bank, content or description fails the build
quality: qg-checkable
stimulus: The creator's assistant writes data that breaks the archetype's schema or a rule the schema cannot say
response: The build fails with one line per problem naming the file, the place and what to change
metric: 0 pages written from invalid data; every problem named in one line
:::
```

## No WCAG violation found by axe

`lernapps check` runs axe-core for WCAG 2.1 A and AA on each page it visits. For an app whose entry declares its limits
the finding should become a warning; that is not built yet, so it is an error for every app today.

```arc42
:::quality-scenario
id: qs-axe-clean
title: axe finds no WCAG 2.1 A or AA violation
quality: qg-accessibility
stimulus: lernapps check visits the pages of the built app
response: Each axe violation is reported as an error of accessible, naming the page and element
metric: 0 axe violations of WCAG 2.1 A or AA on every page
:::
```

## Usable at 360 px

`lernapps check` measures each page in a 360 px wide window.

```arc42
:::quality-scenario
id: qs-usable-at-360px
title: No page wider than 360 px
quality: qg-accessibility
stimulus: lernapps check opens every page of the built app in a 360 px wide window
response: A wider page is an error of usable-at-360px, naming the elements that are too wide
metric: Page width at most 360 px on every page
:::
```

## Code no block claims

Not built yet (decided sketch, step 12, section 4): before a commit, `arc42 diff --staged --strict` compares the staged
code with the architecture; it matters for interactive apps, whose code is free.

```arc42
:::quality-scenario
id: qs-architecture-current
title: New code without a building block fails the commit
quality: qg-understandable
stimulus: An assistant stages new code under src/ that no building block claims, or a block changed without its prose
response: arc42 diff --staged --strict fails the commit and names the unclaimed path or the block
metric: 0 unclaimed paths under src/ at every commit, in about 0.2 s
:::
```


The interactive archetype's scenarios, besides the generic ones.


## The same inputs play the same twice

At build, every playthrough is played against the core twice, with only the ticks its steps name; a core that draws
from `Math.random` or
the clock gives different states.

```arc42
:::quality-scenario
id: qs-deterministic-core
title: The same inputs give the same states
quality: qg-checkable
stimulus: The build plays a playthrough's seed, route and inputs against the core twice
response: The build fails with one line naming the first step whose state differs, or whose state differs from the expected one
metric: Both plays give identical states at every step and match every expected state, else the build fails
:::
```

## Playthroughs in the browser

`interactiveTests()` plays every playthrough at its address in the browser, at desktop width and at 360 px.

```arc42
:::quality-scenario
id: qs-playthrough-in-browser
title: Playthroughs play the same in the browser
quality: qg-checkable
stimulus: lernapps check --pre-push runs the e2e tests on the built app
response: Each playthrough opens app/?seed=<seed>#<route> on the test clock, gives its inputs and ticks and compares the state and the polite announcement after each step
metric: Every expected state and announcement matches, with no console error, at desktop width and 360 px
:::
```

<!-- app: begin -->
<!-- app: end -->
