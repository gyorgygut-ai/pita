import { createSignal } from "solid-js";
import { composeReply } from "./compose.js";
import { nextIndex, prevIndex, toggleSelected } from "./selection.js";
export const createPitaController = deps => {
  const [screen, setScreen] = createSignal("select");
  const [highlight, setHighlight] = createSignal(deps.segments.length === 0 ? -1 : 0);
  const [selected, setSelected] = createSignal([]);
  const [reply, setReply] = createSignal("");
  const next = () => {
    setHighlight(nextIndex(highlight(), deps.segments.length));
  };
  const prev = () => {
    setHighlight(prevIndex(highlight(), deps.segments.length));
  };
  const toggle = () => {
    if (highlight() >= 0) {
      setSelected(toggleSelected(selected(), highlight()));
    }
  };
  const compose = () => {
    setReply(composeReply(deps.message, deps.segments, selected()));
    setScreen("compose");
  };
  const submit = text => {
    void deps.submit(text);
  };
  const back = () => {
    if (screen() === "compose") {
      setScreen("select");
      return;
    }
    deps.close();
  };
  return {
    message: () => deps.message,
    segments: () => deps.segments,
    screen,
    highlight,
    selected,
    reply,
    next,
    prev,
    toggle,
    compose,
    setReply,
    submit,
    back
  };
};