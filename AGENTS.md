# PITA

**Value Proposition**: OpenCode plugin for quick user responses.

---

## Process

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
  - `Highlighted`: Opencode theme `accent` bg + fitting color
  - `Selected`: Opencode theme `primary` bg + fitting color
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

**Verification**:

- **Problem**: I want deterministic quality assurance
- **Tool**: `tests/unit/*.test.ts`, `tests/acceptance/*.test.ts`
- **Acceptance**:

  - Simple tests; input from fixtures; one assert on output
  - Test invalid, none, 0-input, simple, complex inputs
  - Avoid mocking, hacking or any magic; use DI patterns

---

# Non-negotiables

**Correct**:

- **Goal**: Spec adherence across the codebase without gaps
- **Approach**: Code matched to authoritive specs; NOT specs to code
- **Outcome**: Code fulfilling acceptance criteria as specs dictate

**Clean**:

- **Goal**: Clean, elegant, test-first codebase without dead code
- **Approach**: Use DI. No comments, dead code. Let TS infer types
- **Outcome**: Simple code fulfilling requirements, without drift

**Opencode**:

- **Goal**: Idiomatic NX patterns instead of hand-rolling and guesses
- **Approach**: Use the `edit-opencode` skill to used verified patterns
- **Outcome**: Minimal code fulfilling all requirements, without drift
