import { createComponent as _$createComponent } from "@opentui/solid";
import { Show, createSignal, onMount } from "solid-js";
import { Plugin, usePlugin } from "@opencode/plugin/tui";
import { apfel } from "./apfel.js";
import { createPitaController } from "../../core/controller.js";
import { parseOptions } from "../../config/options.js";
import { PitaShell } from "../../ui/screens.js";
import { resolveStrategy } from "../../strategies/index.js";
import { pitaTheme } from "../../ui/theme.js";
export const pitaPageName = "pita.reply";
export const createOpenCodeSubmissionStrategy = (sessionID, prompt) => text => prompt({
  sessionID,
  text
});
const opencodePitaTheme = (theme, mode) => pitaTheme({
  accent: theme.hue.accent[200],
  primary: theme.hue.interactive[200],
  onAccent: mode === "dark" ? theme.hue.neutral[100] : theme.hue.neutral[900],
  onPrimary: mode === "dark" ? theme.hue.neutral[100] : theme.hue.neutral[900],
  text: theme.text.base,
  muted: theme.text.muted,
  border: theme.border.base
});
export const assistantText = content => content.filter(part => part.type === "text").map(part => part.text ?? "").join("");
export const lastAssistantText = (context, sessionID) => {
  const messages = context.data.session.message.list(sessionID);
  const assistant = messages.filter(message => message.type === "assistant").at(-1);
  if (assistant === undefined) {
    return "";
  }
  return assistantText(assistant.content);
};
export const PitaReply = props => {
  const context = usePlugin();
  const theme = () => opencodePitaTheme(context.theme, context.themeMode);
  const [controller, setController] = createSignal();
  const [editor, setEditor] = createSignal(undefined);
  const attachEditor = node => setEditor(node);
  const close = () => {
    context.ui.router.navigate({
      type: "session",
      sessionID: props.sessionID
    });
  };
  const submit = createOpenCodeSubmissionStrategy(props.sessionID, input => context.client.session.prompt(input));
  const accept = () => {
    const current = controller();
    if (current === undefined) {
      return;
    }
    if (current.screen() === "select") {
      current.compose();
      return;
    }
    current.submit(editor()?.plainText ?? current.reply());
  };
  context.keymap.layer(() => ({
    commands: [{
      id: "pita.segment.next",
      title: "Pita: highlight next segment",
      bind: "down",
      enabled: () => controller()?.screen() === "select",
      run: () => controller()?.next()
    }, {
      id: "pita.segment.previous",
      title: "Pita: highlight previous segment",
      bind: "up",
      enabled: () => controller()?.screen() === "select",
      run: () => controller()?.prev()
    }, {
      id: "pita.segment.toggle",
      title: "Pita: toggle highlighted segment",
      bind: "space",
      enabled: () => controller()?.screen() === "select",
      run: () => controller()?.toggle()
    }, {
      id: "pita.accept",
      title: "Pita: compose reply or send it",
      bind: "return",
      run: accept
    }, {
      id: "pita.back",
      title: "Pita: return or close",
      bind: "escape",
      run: () => controller()?.back()
    }],
    bindings: ["pita.segment.next", "pita.segment.previous", "pita.segment.toggle", "pita.accept", "pita.back"]
  }));
  const load = async () => {
    await context.data.session.message.sync(props.sessionID);
    const message = lastAssistantText(context, props.sessionID);
    setController(createPitaController({
      message,
      segments: await props.strategy(message),
      close,
      submit
    }));
  };
  onMount(() => {
    void load();
  });
  return _$createComponent(Show, {
    get when() {
      return controller();
    },
    children: current => _$createComponent(PitaShell, {
      get controller() {
        return current();
      },
      theme: theme,
      editor: attachEditor
    })
  });
};
export default Plugin.define({
  id: "pita",
  setup: context => {
    const {
      strategy,
      keybind
    } = parseOptions(context.options);
    const run = resolveStrategy(strategy, {
      runApfel: apfel
    });
    const unregister = context.ui.router.register({
      name: pitaPageName,
      render: ({
        data
      }) => {
        const sessionID = typeof data?.sessionID === "string" ? data.sessionID : undefined;
        return _$createComponent(Show, {
          when: sessionID,
          children: current => _$createComponent(PitaReply, {
            get sessionID() {
              return current();
            },
            strategy: run
          })
        });
      }
    });
    context.keymap.layer(() => ({
      mode: "global",
      commands: [{
        id: "pita.open",
        title: "Pita: reply to segments",
        description: "Select segments of the last assistant message and compose a reply",
        bind: keybind,
        palette: true,
        run: () => {
          const current = context.ui.router.current();
          if (current.type !== "session") {
            return;
          }
          context.ui.router.navigate({
            type: "plugin",
            name: pitaPageName,
            data: {
              sessionID: current.sessionID
            }
          });
        }
      }],
      bindings: ["pita.open"]
    }));
    return unregister;
  }
});