
import * as monaco from 'monaco-editor';
import syntax from "./syntax";
import theme from "./theme";

export default function init(element) {
  monaco.languages.register({ id: "kdb/q" });
  monaco.languages.setMonarchTokensProvider("kdb/q", syntax);
  monaco.editor.defineTheme("kdb", theme);

   monaco.editor.create(element, {
      value: "([] c1:1000+til 100; c2:100?`a`b`c; c3:10*1+til 100)",
      language: "kdb/q",
      theme: "kdb",
      minimap: {
        enabled: false,
      },
      automaticLayout: true,
    });
}
