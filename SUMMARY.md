---
title: Plugin Features
---

# opencode-pita-plugin - Features

A plugin that provides a segment-based text viewer/editor for assistant messages in OpenCode.

## Overview

This plugin brings the functionality of `sentence-pick.sh` to OpenCode: it splits assistant responses into meaningful segments (sentences or words), lets you navigate and select them, then lets you assemble your selections into a new message.

## How It Works

### 1. Segmenting
When you trigger the plugin, it:
- Reads the latest assistant message from your current session
- Normalizes the text (newlines → spaces, collapses whitespace)
- Splits it into segments using one of these strategies:
  - **sentence** (default): Splits on `.`, `!`, `?` sentence boundaries
  - **word**: Splits on whitespace token boundaries
  - **apfel**: Uses the `apfel` CLI for LLM-based natural segmentation (requires external binary)

### 2. Navigation (Segment Viewer)
You get a fullscreen view of the entire message with each segment visually marked:
- **↑ / ↓ arrows**: Move cursor between segments
- **SPACE**: Toggle a segment as selected (flagged)
- **Enter**: View only your selected segments in the editor
- **q**: Quit

### 3. Editing (Selected Segments)
Pressing Enter shows only your flagged segments, each wrapped in quotation marks and separated by blank lines:
```
"First selected segment of text here."

<cursor starts here after first segment>
"Second selected segment of text here."
```

### 4. Submission
Once you've reviewed and edited the assembled text in the editor:
- **Enter**: Sends the text to the chat box as a new message
- **Escape**: Cancels and closes the panel

## Installation & Usage

1. Enable the plugin in OpenCode (it should be auto-discovered in your project)
2. Press **ctrl+shift+h** to open the last assistant message
3. Navigate, flag with SPACE, press Enter, edit, and submit

## Configuration

The plugin supports configuration for the default segmentation strategy. By default, it uses sentence-based segmentation, which mirrors the behavior of the original script.

## Key Differences from sentence-pick.sh

- Runs inside OpenCode rather than as a standalone terminal app
- Integrates directly with the chat workflow (submit results back to messages)
- No external dependencies required for basic usage
- Persistent state across plugin reloads