// editor bootstrap, taken from:
// https://github.com/microsoft/monaco-editor-samples/tree/main/electron-amd-nodeIntegration

const path = require("path");
const amdLoader = require("monaco-editor/min/vs/loader");
const syntax = require("./syntax");
const theme = require("./theme");
const amdRequire = amdLoader.require;

function uriFromPath(_path) {
  var pathName = path.resolve(_path).replace(/\\/g, "/");
  if (pathName.length > 0 && pathName.charAt(0) !== "/") {
    pathName = "/" + pathName;
  }
  return encodeURI("file://" + pathName);
}

amdRequire.config({
  baseUrl: uriFromPath(
    path.join(__dirname, "../node_modules/monaco-editor/min")
  ),
});

// workaround monaco-css not understanding the environment
// self.module = undefined;

module.exports = new Promise((resolve) => {
  amdRequire(["vs/editor/editor.main"], () => {
    monaco.languages.register({ id: "kdb/q" });
    monaco.languages.setMonarchTokensProvider("kdb/q", syntax);
    monaco.editor.defineTheme("kdb", theme);

    const editor = monaco.editor.create(document.getElementById("txtInput"), {
      value: "4 + 4",
      language: "kdb/q",
      theme: "kdb",
      minimap: {
        enabled: false,
      },
    });
    resolve(editor);
  });
});
