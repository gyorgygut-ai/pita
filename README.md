# Pita

Pita is an OpenCode plugin for selecting parts of the latest assistant response and composing a reply from them. It also includes a standalone OpenTUI runner for manual testing.

## Development

Use the Node version in `.nvmrc`:

```sh
nvm use
npm install
npm run verify
```

`verify` runs lint, build, unit tests, and acceptance tests in order.

## OpenCode plugin

The `regex` strategy segments visible message content into sentences and structural units. The shortcut and strategy are plugin options (`keybind` and `strategy`).

```sh
npm run bundle:local
npm run watch:local
```

Use `bundle:global` or `watch:global` for the global OpenCode plugin installation.

## Standalone TUI

```sh
npm run bundle:standalone
npm run watch:standalone
```

The standalone runner opens the fixture message and exercises the same selection and composition UI as the plugin.

## Previews

### Sample Input and Output

**Input**:

```
📋 TL;DR
You've got 3 options to shape your weekend. Pick one, or mix — just don't do nothing. ⏰
🎉 The Weekend Is Yours
Hey! First off — congrats on making it through another week. The sun's out, the fridge is (mostly) stocked, and the next 48 hours are a blank canvas. Whatever you're craving, we've got a path to get there.
🗺️ Option A: The Explorer

Go somewhere you've never been. A new coffee shop in a neighborhood you always drive past. A hiking trail with a view you've only seen on Instagram. A museum exhibit that makes you say "huh, I didn't know that."

🏠 Option B: The Cozy Day

Stay in. Pajamas all day. A stack of books, a blanket, and that show you've been putting off for three months. Make a soup that takes two hours and smells like garlic and thyme. Light a candle. Turn your phone on airplane mode.

Sometimes the best plan is no plan. And that's not laziness — that's recovery.

🎨 Option C: The Creator
Make something. Write a letter to a friend you haven't talked to in years. Sketch that thing that's been in your head. Bake bread from scratch and burn the bottom (it's fine — character). Record a song, plant a herb garden, build a shelf that actually holds weight.

You don't need to be good at it. You just need to do it.

🎯 Your Move
So — which one's calling your name?
1. Explorer — new places, fresh air, a story to tell Monday
2. Cozy — soft blankets, zero obligations, total recharge
3. Creator — messy hands, proud heart, something real to show for it
Drop a 🧭, 🛋️, or 🎨 below and I'll help you build the plan.
```

**Segments (33 total)**:

```
0-52   | "📋 TL;DR
You've got 3 options to shape your weekend."
53-94  | "Pick one, or mix — just don't do nothing."
95-125 | "⏰
🎉 The Weekend Is Yours
Hey!"
126-181| "First off — congrats on making it through another week."
182-270| "The sun's out, the fridge is (mostly) stocked, and the next 48 hours are a blank canvas."
271-326| "Whatever you're craving, we've got a path to get there."
327-386| "🗺️ Option A: The Explorer

Go somewhere you've never been."
387-445| "A new coffee shop in a neighborhood you always drive past."
446-503| "A hiking trail with a view you've only seen on Instagram."
504-566| "A museum exhibit that makes you say "huh, I didn't know that.""
567-617| "The goal isn't the destination — it's the novelty."
618-697| "Your brain loves fresh inputs, and your weekend will feel bigger because of it."
699-734| "🏠 Option B: The Cozy Day

Stay in."
735-751| "Pajamas all day."
752-836| "A stack of books, a blanket, and that show you've been putting off for three months."
837-903| "Make a soup that takes two hours and smells like garlic and thyme."
904-919| "Light a candle."
920-953| "Turn your phone on airplane mode."
954-989| "Sometimes the best plan is no plan."
990-1032| "And that's not laziness — that's recovery."
1034-1074| "🎨 Option C: The Creator
Make something."
1075-1133| "Write a letter to a friend you haven't talked to in years."
1134-1177| "Sketch that thing that's been in your head."
1178-1246| "Bake bread from scratch and burn the bottom (it's fine — character)."
1247-1324| "Record a song, plant a herb garden, build a shelf that actually holds weight."
1325-1357| "You don't need to be good at it."
1358-1381| "You just need to do it."
1382-1430| "🎯 Your Move
So — which one's calling your name?"
1431-1490| "1. Explorer — new places, fresh air, a story to tell Monday"
1491-1548| "2. Cozy — soft blankets, zero obligations, total recharge"
1549-1617| "3. Creator — messy hands, proud heart, something real to show for it"
1618-1679| "Drop a 🧭, 🛋️, or 🎨 below and I'll help you build the plan."
```
