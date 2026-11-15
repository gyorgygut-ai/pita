import { createComponent as _$createComponent } from "@opentui/solid";
import { Show, createSignal, onCleanup, onMount } from "solid-js";
import { RGBA } from "@opentui/core";
import { render, useKeyboard, useRenderer } from "@opentui/solid";
import { pathToFileURL } from "node:url";
import { readFileSync } from "node:fs";
import { createPitaController } from "../../core/controller.js";
import { PitaFrame, PitaShell, ReplyResultScreen } from "../../ui/screens.js";
import { regexStrategy } from "../../strategies/index.js";
import { pitaTheme } from "../../ui/theme.js";
export const standaloneMessage = readFileSync(new URL("../../../tests/fixtures/standalone-message.txt", import.meta.url), "utf8").trimEnd();
export const standalonePalette = {
  accent: RGBA.fromInts(59, 130, 246),
  primary: RGBA.fromInts(37, 99, 235),
  onPrimary: RGBA.fromInts(255, 255, 255),
  text: RGBA.fromInts(229, 229, 229),
  muted: RGBA.fromInts(163, 163, 163),
  border: RGBA.fromInts(82, 82, 82)
};
export const StandaloneApp = props => {
  const renderer = useRenderer();
  onMount(() => {
    renderer.enableKittyKeyboard(5);
    onCleanup(() => renderer.enableKittyKeyboard(5));
  });
  const [editor, setEditor] = createSignal(undefined);
  const [submitted, setSubmitted] = createSignal();
  const controller = createPitaController({
    message: props.message,
    segments: props.segments,
    close: () => {
      props.onClose?.();
      renderer.destroy();
    },
    submit: text => {
      setSubmitted({
        text
      });
    }
  });
  useKeyboard(key => {
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
  const theme = () => pitaTheme(standalonePalette);
  return _$createComponent(Show, {
    get when() {
      return submitted();
    },
    get fallback() {
      return _$createComponent(PitaShell, {
        controller: controller,
        theme: theme,
        editor: setEditor
      });
    },
    children: result => _$createComponent(PitaFrame, {
      theme: theme,
      get children() {
        return _$createComponent(ReplyResultScreen, {
          get text() {
            return result().text;
          }
        });
      }
    })
  });
};
export const startStandalone = async (message = standaloneMessage) => {
  const segments = await regexStrategy(message);
  await render(() => _$createComponent(StandaloneApp, {
    message: message,
    segments: segments
  }));
};
const entry = process.argv[1];
if (entry !== undefined && import.meta.url === pathToFileURL(entry).href) {
  void startStandalone();
}