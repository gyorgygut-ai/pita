import { jsx as _jsx, jsxs as _jsxs } from "@opentui/solid/jsx-runtime";
import { For, Show, createSignal, onMount } from "solid-js";
import { Plugin, usePlugin } from "@opencode/plugin/tui";
import { composeReply } from "./compose.js";
import { apfel } from "./apfel.js";
import { parseOptions } from "./options.js";
import { isSelected, nextIndex, prevIndex, toggleSelected } from "./selection.js";
import { resolveStrategy } from "./strategies/index.js";
import { pitaTheme } from "./theme.js";
export const pitaPanelName = "pita.reply";
export const lastAssistantText = (context, sessionID) => {
    const messages = context.data.session.message.list(sessionID);
    const assistant = messages.filter((message) => message.type === "assistant").at(-1);
    if (assistant === undefined) {
        return "";
    }
    return assistant.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
};
const picked = (props, index) => isSelected(props.selected(), index);
const highlighted = (props, index) => props.highlight() === index;
const segmentBackground = (props, index) => {
    if (picked(props, index)) {
        return props.theme().selected.background;
    }
    if (highlighted(props, index)) {
        return props.theme().highlighted.background;
    }
    return undefined;
};
const segmentForeground = (props, index) => {
    if (picked(props, index)) {
        return props.theme().selected.foreground;
    }
    if (highlighted(props, index)) {
        return props.theme().highlighted.foreground;
    }
    return props.theme().text;
};
export const SelectScreen = (props) => (_jsxs("box", { flexDirection: "column", children: [_jsx("text", { fg: props.theme().muted, children: "Up and Down highlight, Space toggles, Enter composes, Esc closes" }), _jsx(For, { each: props.segments(), children: (segment, index) => (_jsx("box", { backgroundColor: segmentBackground(props, index()), children: _jsx("text", { fg: segmentForeground(props, index()), children: props.message().slice(segment.start, segment.end) }) })) })] }));
export const ComposeScreen = (props) => (_jsxs("box", { flexDirection: "column", children: [_jsx("text", { fg: props.theme().muted, children: "Enter sends, Esc returns to the selection" }), _jsx("textarea", { ref: props.editor, focused: true, initialValue: props.reply(), focusedBackgroundColor: props.theme().selected.background, focusedTextColor: props.theme().selected.foreground })] }));
export const PitaPanel = (props) => {
    const context = usePlugin();
    const theme = () => pitaTheme(context.theme, context.themeMode);
    const [message, setMessage] = createSignal("");
    const [segments, setSegments] = createSignal([]);
    const [highlight, setHighlight] = createSignal(-1);
    const [selected, setSelected] = createSignal([]);
    const [screen, setScreen] = createSignal("select");
    const [reply, setReply] = createSignal("");
    const [editor, setEditor] = createSignal(undefined);
    const attachEditor = (node) => setEditor(node);
    const close = () => props.panel.close();
    const send = async () => {
        await context.client.session.prompt({
            sessionID: props.panel.sessionID,
            text: editor()?.plainText ?? reply(),
        });
        close();
    };
    const accept = () => {
        if (screen() === "select") {
            setReply(composeReply(message(), segments(), selected()));
            setScreen("compose");
            return;
        }
        void send();
    };
    const back = () => {
        if (screen() === "compose") {
            setScreen("select");
            return;
        }
        close();
    };
    const toggle = () => {
        const index = highlight();
        if (index >= 0) {
            setSelected(toggleSelected(selected(), index));
        }
    };
    context.keymap.layer(() => ({
        commands: [
            {
                id: "pita.segment.next",
                title: "Pita: highlight next segment",
                bind: "down",
                enabled: () => screen() === "select",
                run: () => setHighlight(nextIndex(highlight(), segments().length)),
            },
            {
                id: "pita.segment.previous",
                title: "Pita: highlight previous segment",
                bind: "up",
                enabled: () => screen() === "select",
                run: () => setHighlight(prevIndex(highlight(), segments().length)),
            },
            {
                id: "pita.segment.toggle",
                title: "Pita: toggle highlighted segment",
                bind: "space",
                enabled: () => screen() === "select",
                run: toggle,
            },
            {
                id: "pita.accept",
                title: "Pita: compose reply or send it",
                bind: "return",
                run: accept,
            },
            {
                id: "pita.back",
                title: "Pita: return or close",
                bind: "escape",
                run: back,
            },
        ],
        bindings: [
            "pita.segment.next",
            "pita.segment.previous",
            "pita.segment.toggle",
            "pita.accept",
            "pita.back",
        ],
    }));
    const load = async () => {
        await context.data.session.message.sync(props.panel.sessionID);
        const text = lastAssistantText(context, props.panel.sessionID);
        setMessage(text);
        setSegments(await props.strategy(text));
    };
    onMount(() => {
        void load();
    });
    return (_jsx("box", { flexDirection: "column", padding: 1, borderStyle: "single", borderColor: theme().border, children: _jsx(Show, { when: screen() === "select", fallback: _jsx(ComposeScreen, { reply: reply, editor: attachEditor, theme: theme }), children: _jsx(SelectScreen, { message: message, segments: segments, highlight: highlight, selected: selected, theme: theme }) }) }));
};
export const pitaPanelContribution = (strategy) => ({
    append: "session.panel",
    render: (panel) => (_jsx(Show, { when: panel.name === pitaPanelName, children: _jsx(PitaPanel, { panel: panel, strategy: strategy }) })),
});
export default Plugin.define({
    id: "pita",
    setup: (context) => {
        const { strategy } = parseOptions(context.options);
        const unregister = context.ui.slot(pitaPanelContribution(resolveStrategy(strategy, { runApfel: apfel })));
        context.keymap.layer(() => ({
            mode: "global",
            commands: [
                {
                    id: "pita.open",
                    title: "Pita: reply to segments",
                    description: "Select segments of the last assistant message and compose a reply",
                    bind: "<leader>p",
                    palette: true,
                    run: () => {
                        context.ui.panel.open(pitaPanelName, { presentation: "fullscreen" });
                    },
                },
            ],
            bindings: ["pita.open"],
        }));
        return unregister;
    },
});
