// editor bootstrap, taken from:
// https://github.com/microsoft/monaco-editor-samples/tree/main/electron-amd-nodeIntegration

const path = require("path");
const amdLoader = require("./node_modules/monaco-editor/min/vs/loader.js");
const syntax = require("./syntax");
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
    path.join(__dirname, "./node_modules/monaco-editor/min")
  ),
});

// workaround monaco-css not understanding the environment
// self.module = undefined;

module.exports = new Promise((resolve) => {
  amdRequire(["vs/editor/editor.main"], () => {
    // Register a new language
    monaco.languages.register({ id: "kdb/q" });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider("kdb/q", syntax);

    const editor = monaco.editor.create(document.getElementById("txtInput"), {
      value: "4 + 4",
      language: "kdb/q",
      minimap: {
        enabled: false,
      },
    });
    resolve(editor);
  });
});
