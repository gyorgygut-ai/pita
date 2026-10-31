import { memo as _$memo } from "@opentui/solid";
import { use as _$use } from "@opentui/solid";
import { effect as _$effect } from "@opentui/solid";
import { insert as _$insert } from "@opentui/solid";
import { createComponent as _$createComponent } from "@opentui/solid";
import { createTextNode as _$createTextNode } from "@opentui/solid";
import { insertNode as _$insertNode } from "@opentui/solid";
import { setProp as _$setProp } from "@opentui/solid";
import { createElement as _$createElement } from "@opentui/solid";
import { For, createEffect, createMemo, createSignal } from "solid-js";
import { SyntaxStyle } from "@opentui/core";
import { quotedRanges } from "./compose.js";
import { layoutRuns } from "./layout.js";
import { isSelected } from "./selection.js";
const runBackground = (theme, selected, highlighted) => {
  if (selected) {
    return theme.selected.background;
  }
  if (highlighted) {
    return theme.highlighted.background;
  }
  return undefined;
};
const runForeground = (theme, selected, highlighted) => {
  if (selected) {
    return theme.selected.foreground;
  }
  if (highlighted) {
    return theme.highlighted.foreground;
  }
  return theme.text;
};
export const SelectScreen = props => {
  const runs = createMemo(() => layoutRuns(props.controller.message(), props.controller.segments()));
  return (() => {
    var _el$ = _$createElement("box"),
      _el$2 = _$createElement("box"),
      _el$3 = _$createElement("text"),
      _el$5 = _$createElement("scrollbox"),
      _el$6 = _$createElement("text");
    _$insertNode(_el$, _el$2);
    _$insertNode(_el$, _el$5);
    _$setProp(_el$, "flexDirection", "column");
    _$setProp(_el$, "flexGrow", 1);
    _$insertNode(_el$2, _el$3);
    _$setProp(_el$2, "height", 1);
    _$insertNode(_el$3, _$createTextNode(`Up and Down highlight, Space toggles, Enter composes, Esc closes`));
    _$insertNode(_el$5, _el$6);
    _$setProp(_el$5, "flexGrow", 1);
    _$setProp(_el$5, "minHeight", 0);
    _$setProp(_el$5, "stickyScroll", true);
    _$setProp(_el$6, "wrapMode", "word");
    _$insert(_el$6, _$createComponent(For, {
      get each() {
        return runs();
      },
      children: run => {
        const selected = () => run.segment !== null && isSelected(props.controller.selected(), run.segment);
        const highlighted = () => run.segment !== null && props.controller.highlight() === run.segment;
        const style = () => ({
          fg: runForeground(props.theme(), selected(), highlighted()),
          bg: runBackground(props.theme(), selected(), highlighted())
        });
        return (() => {
          var _el$7 = _$createElement("span");
          _$insert(_el$7, () => run.text);
          _$effect(_$p => _$setProp(_el$7, "style", style(), _$p));
          return _el$7;
        })();
      }
    }));
    _$effect(_$p => _$setProp(_el$3, "fg", props.theme().muted, _$p));
    return _el$;
  })();
};
export const ComposeScreen = props => {
  const [node, setNode] = createSignal();
  const [selectedStyle, setSelectedStyle] = createSignal();
  createEffect(() => {
    const editor = node();
    const reply = props.controller.reply();
    if (editor === undefined) {
      return;
    }
    let entry = selectedStyle();
    if (entry === undefined) {
      const style = SyntaxStyle.fromStyles({
        "pita-selected": {
          fg: props.theme().selected.foreground,
          bg: props.theme().selected.background
        }
      });
      const id = style.resolveStyleId("pita-selected");
      if (id === null) {
        return;
      }
      editor.syntaxStyle = style;
      entry = {
        id
      };
      setSelectedStyle(entry);
    }
    editor.extmarks.clear();
    for (const range of quotedRanges(reply)) {
      editor.extmarks.create({
        start: range.start,
        end: range.end,
        styleId: entry.id
      });
    }
  });
  return (() => {
    var _el$8 = _$createElement("box"),
      _el$9 = _$createElement("text"),
      _el$1 = _$createElement("textarea");
    _$insertNode(_el$8, _el$9);
    _$insertNode(_el$8, _el$1);
    _$setProp(_el$8, "flexDirection", "column");
    _$insertNode(_el$9, _$createTextNode(`Enter sends, Esc returns to the selection`));
    _$use(value => {
      setNode(value);
      props.editor(value);
    }, _el$1);
    _$setProp(_el$1, "focused", true);
    _$setProp(_el$1, "onContentChange", () => props.controller.setReply(node()?.plainText ?? ""));
    _$effect(_p$ => {
      var _v$ = props.theme().muted,
        _v$2 = props.controller.reply();
      _v$ !== _p$.e && (_p$.e = _$setProp(_el$9, "fg", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp(_el$1, "initialValue", _v$2, _p$.t));
      return _p$;
    }, {
      e: undefined,
      t: undefined
    });
    return _el$8;
  })();
};
export const PitaShell = props => (() => {
  var _el$10 = _$createElement("box");
  _$setProp(_el$10, "flexDirection", "column");
  _$setProp(_el$10, "padding", 1);
  _$setProp(_el$10, "borderStyle", "single");
  _$insert(_el$10, (() => {
    var _c$ = _$memo(() => props.controller.screen() === "select");
    return () => _c$() ? _$createComponent(SelectScreen, {
      get controller() {
        return props.controller;
      },
      get theme() {
        return props.theme;
      }
    }) : _$createComponent(ComposeScreen, props);
  })());
  _$effect(_$p => _$setProp(_el$10, "borderColor", props.theme().border, _$p));
  return _el$10;
})();