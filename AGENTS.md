# PITA

**Value Proposition**: OpenCode plugin for quick user responses.

---

## RULES

**Activate Skills**:

- [`test-driven-development`](.opencode/skills/test-driven-development/SKILL.md)
- [`verification-before-completion`](.opencode/skills/verification-before-completion/SKILL.md)

**Non-negotiables**:

- **No guessing**: Verify OpenCode APIs against official docs and source
- **No hand-rolling**: Use native OpenCode capabilities, minimal elegant code
- **$ = P = f(test+code)**: Always show proof; automated, deterministic + E2E execution

**Specs = Authoritative**:

- **Problem**: I want spec adherence across the codebase
- **Approach**: Code matched to specs, always; NOT specs to code
- **Outcome**: Code fulfilling acceptance criteria; WITHOUT exception

---

## SPECS

**1. Plugin Trigger**:

- **Problem**: I want to compose replies without manual copy-pasting
- **Approach**: A keyboard shortcut triggers the plugin segment selection state 
- **Outcome**: The last assistant message is displayed in a full screen TUI route
- **Acceptance**:
  - Shortcut key configurable in settings
  - Assistant message formatting unchanged

**2. Segment Selection**:

- **Problem**: I want to `select` distinct logical units pre-defined from the message
- **Approach**: Strategy pattern, each mapping message to [{startIndex, endIndex}]
- **Outcome**: The message can be navigated to toggle segments as selected
- **Acceptance**:
  - Strategy to use configurable in settings
  - Assistant message formatting unchanged
  - `Highlighted`: Opencode theme `accent` bg - `theme.hue.accent[200]` + fitting color
  - `Selected`: Opencode theme `primary` bg - `theme.hue.interactive[200]` + fitting color
  - `Up` key highlights the previous / last segment
  - `Down` key highlights the next / first segment
  - `Space` key adds current highlighted segments to selected list
  - `Space` key on selected segment removes it from selected list
  - `Esc` key closes segment selection; goes back to chat
  - `Enter` key submits selection; goes to next screen

**2.1 Strategy: Sentence**:

- **Tool**: `src/strategies/sentence.ts`
- **Acceptance**:

  - Default setting
  - Input: message as string
  - Split text into individual sentences
  - Output: segments of { start, end }

**2.2 Strategy: Apfel**:

- **Tool**: `src/strategies/llm-apfel.ts`
- **Acceptance**:
  - Input: message as string
  - Request segmenting decision from LLM 
  - Map LLM decision to output segment list
  - Output: segments of { start, end }

**3. Reply Composition**:

- **Problem**: I want to compose my response to the `selected` segments
- **Approach**: The selected segments appear pre-filled in an editor
- **Outcome**: The response to the segments can be freely edited
- **Acceptance**:
  - Segments use same `Selected` style, but in quotation marks
  - There are two blank lines between each displayed segment
  - The entire content is editable, including the segments
  - `Esc` key closes reply composition; goes back to selection
  - `Enter` key submits the composition; copies response to chat box

---

## Manual Testing

**In OpenCode CLI**:

- **Problem**: I want to manual test in OpenCode
- **Approach**:
  - `npm run build`: builds `./src` into `./dist`
  - `bundle:local`: installs local copy of `./dist`
  - `bundle:global`: installs global copy of `./dist`
  - `watch:local`: installs local copy on `./src` change
  - `watch:global`: installs global copy on `./src` change
- **Outcome**: 
  - Local install overwritten at `./opencode/plugins/pita`
  - Global install overwritten at `~/.config/opencode/plugins/pita`

**In Standalone TUI**:

- **Problem**: I want to manual test outside OpenCode
- **Approach**:
  - `npm run build`: builds `./src` into `./dist`
  - `bundle:standalone`: serves `./dist` in a standalone tui
  - `watch:standalone`: serves `./dist` in a standalone tui
  - Code must be decoupled from OpenCode apis; use DI
- **Runtime**:
  - Node 26.4 via `.nvmrc` + `devEngines` enforcement
  - `--experimental-ffi --conditions=browser`
  - No Bun dependency
  - `babel` compiles `./src` into `./dist`; `tsx` is not used
- **Outcome**: 
  - `Segment Selection` displayed with a `fixture message`
  - Identical behaviour: submit displays `Reply Composition`
  - Code kept identical, only difference is `TUI<->plugin` glue
- **Acceptenance**:
  - Identical code rendered in `opentui`
  - `bundle:standalone` opens the fixture message on `Segment Selection`
  - `Enter` on a selection displays `Reply Composition`
  - `watch:standalone` rebuilds and restarts on `./src` change
  - Shared modules import no `@opencode/*`: `screens`, `controller`, `compose`, `selection`, `strategies`, `theme`
  - Host glue limited to `tui.tsx` (plugin) and `standalone.tsx` (TUI)

---

## Verification

**Non-negotiable**:

- **Proof**: the verification chain must prove all changes
- **Progress**: tier-by-tier; until all passed or failure
- **Failures**: report; investigate; fix; restart verification
- **Tidiness**: at most 6 lines per test: `setup` \n `act` \n `assert`

**Gated Tiers**:

- **🧐 Tier 1**: `lint`
- **📦 Tier 2**: `build`
- **🏡 Tier 3**: `test:unit`
- **🏰 Tier 4**: `test:acceptance`
- **💪🏾 `verify`**: `t1` && `t2` && `t3` && `t4`

**Scripts**: `test:unit` → `tests/unit` · `test:acceptance` → `tests/acceptance` · `verify` = `t1 && t2 && t3 && t4`
