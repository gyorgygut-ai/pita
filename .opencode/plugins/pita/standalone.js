import { createComponent as _$createComponent } from "@opentui/solid";
import { createSignal } from "solid-js";
import { RGBA } from "@opentui/core";
import { render, useKeyboard, useRenderer } from "@opentui/solid";
import { pathToFileURL } from "node:url";
import { createPitaController } from "./controller.js";
import { standaloneMessage } from "./fixtures.js";
import { PitaShell } from "./screens.js";
import { sentenceStrategy } from "./strategies/sentence.js";
import { pitaTheme } from "./theme.js";
export const standalonePalette = {
  accent: RGBA.fromInts(59, 130, 246),
  primary: RGBA.fromInts(37, 99, 235),
  onAccent: RGBA.fromInts(11, 11, 11),
  onPrimary: RGBA.fromInts(255, 255, 255),
  text: RGBA.fromInts(229, 229, 229),
  muted: RGBA.fromInts(163, 163, 163),
  border: RGBA.fromInts(82, 82, 82)
};
export const StandaloneApp = props => {
  const renderer = useRenderer();
  const [editor, setEditor] = createSignal(undefined);
  const controller = createPitaController({
    message: props.message,
    segments: props.segments,
    close: () => {
      props.onClose?.();
      renderer.destroy();
    },
    send: text => {
      props.onSend?.(text);
      renderer.destroy();
    }
  });
  useKeyboard(key => {
    if (key.name === "down" && controller.screen() === "select") {
      key.preventDefault();
      controller.next();
      return;
    }
    if (key.name === "up" && controller.screen() === "select") {
      key.preventDefault();
      controller.prev();
      return;
    }
    if (key.name === "space" && controller.screen() === "select") {
      key.preventDefault();
      controller.toggle();
      return;
    }
    if (key.name === "return") {
      key.preventDefault();
      if (controller.screen() === "select") {
        controller.compose();
        return;
      }
      controller.submit(editor()?.plainText ?? controller.reply());
      return;
    }
    if (key.name === "escape") {
      key.preventDefault();
      controller.back();
    }
  });
  return _$createComponent(PitaShell, {
    controller: controller,
    theme: () => pitaTheme(standalonePalette),
    editor: node => setEditor(node)
  });
};
export const startStandalone = async (message = standaloneMessage) => {
  const segments = await sentenceStrategy(message);
  await render(() => _$createComponent(StandaloneApp, {
    message: message,
    segments: segments,
    onSend: text => {
      process.stdout.write(`${text}\n`);
    }
  }));
};
const entry = process.argv[1];
if (entry !== undefined && import.meta.url === pathToFileURL(entry).href) {
  void startStandalone();
}