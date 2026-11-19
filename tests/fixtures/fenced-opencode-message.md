Up and Down highlight, Space toggles, Enter composes, Esc closes
```markdown
1. **Runtime:** Node.js 26 with TypeScript for a fast, predictable development loop.
2. **UI:** React with a small set of reusable components, keeping the feature easy to iterate on.
3. **State:** Start with local state; add persistence only where the user experience needs it.
4. **Testing:** Cover the core flow with unit tests, then verify the complete experience end to end.
5. **Delivery:** Ship behind a feature flag so we can learn from real usage before a full rollout.

# Vibe Coding a Feature ✨

## The spark 💡

It starts with a tiny annoyance: there’s one extra step between having an idea and seeing it work. Nothing dramatic—just enough friction to interrupt the flow.

So we make a little space, open the editor, and describe the outcome we want. Not every implementation detail. Just the feeling: *this should be clear, quick, and pleasant to use.*

## Finding the shape 🧭

First, we sketch the happy path. A person opens the feature, understands what it does, tries it, and gets a useful result. Then we ask what could make that path confusing: empty states, errors, slow responses, or a button that looks clickable but isn’t.

The goal isn’t to predict everything. It’s
