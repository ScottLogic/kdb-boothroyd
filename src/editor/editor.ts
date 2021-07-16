import { languages, editor } from "monaco-editor";
import syntax from "./syntax";
import theme from "./theme";

export default function initEditor(element: HTMLElement) {
  languages.register({ id: "kdb/q" });
  languages.setMonarchTokensProvider("kdb/q", syntax);
  editor.defineTheme("kdb", theme);

  return editor.create(element, {
    value: "([] c1:1000+til 100; c2:100?`a`b`c; c3:10*1+til 100)",
    language: "kdb/q",
    theme: "kdb",
    minimap: {
      enabled: false,
    },
    automaticLayout: true,
  });
}
