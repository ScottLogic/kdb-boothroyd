import React, {
  createRef,
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import MonacoEditor, { monaco } from "react-monaco-editor";
import { ipcRenderer } from "electron";
import {
  CommandBar,
  useTheme,
  ICommandBarItemProps,
  Stack,
} from "@fluentui/react";
import useResizeObserver from "@react-hook/resize-observer";

import syntax from "../editor/syntax";
import theme from "../editor/theme";
import { editorWindow, editorWrapper } from "../style";

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

export interface FileManagementProps {
  onFilenameChanged: (scriptName: string) => void;
  onUnsavedChangesChanged: (unsavedChanges: boolean) => void;
  filename?: string;
}

interface EditorWindowProps extends FileManagementProps {
  onExecuteQuery: (query: string) => void;
}

// Set some default options for the Monaco Editor
const editorOptions = {
  minimap: {
    enabled: false,
  },
  automaticLayout: true,
};

const EditorWindow: FunctionComponent<EditorWindowProps> = ({
  onExecuteQuery,
  onFilenameChanged,
  filename,
  onUnsavedChangesChanged,
}) => {
  const uiTheme = useTheme();

  const [currentScript, setCurrentScript] = useState("");

  // Find out if system is in dark mode so we can use the appropriate editor theme
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check current theme
  ipcRenderer.invoke("is-dark-mode").then((isDarkMode) => {
    setIsDarkMode(isDarkMode);
  });

  // Handle theme updates
  useEffect(() => {
    ipcRenderer
      .on("colour-scheme-changed", (_, isDarkMode) => {
        setIsDarkMode(isDarkMode);
      })
      .on("file-opened", (_, result) => {
        const { data, filename } = result;
        setCurrentScript(data);
        savedScript.current = data;
        onUnsavedChangesChanged(false);
        editorRef.current?.setValue(data);
        onFilenameChanged(filename);
      });

    return () => {
      ipcRenderer
        .removeAllListeners("colour-scheme-changed")
        .removeAllListeners("file-opened");
    };
  }, []);

  // Store a reference we can use to target the run script button
  const goRef = createRef<HTMLButtonElement>();

  // store previous saved script state
  const savedScript = useRef<string>("");

  // Store a ref to the editor
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const wrapper = useRef(null);

  useEffect(() => {
    window.addEventListener("resize", () => {
      editorRef.current?.layout({ height: 100, width: 100 });
    });
  }, []);

  useResizeObserver(wrapper, (entry) => {
    editorRef.current?.layout({
      height: entry.contentRect.height,
      width: entry.contentRect.width,
    });
  });

  // Before the editor mounts we need to register our q language
  function editorWillMount(monacoEditor: typeof monaco) {
    if (
      !monacoEditor.languages.getLanguages().some(({ id }) => id === "kbd/q")
    ) {
      // Register a new language
      monacoEditor.languages.register({ id: "kbd/q" });
      // Register a tokens provider for the language
      monacoEditor.languages.setMonarchTokensProvider("kbd/q", syntax);
      monacoEditor.editor.defineTheme("kbd", theme);
    }
  }

  // Once the editor is mounted we can manipulate it a bit
  function editorDidMount(editor: IStandaloneCodeEditor) {
    editor.layout({ height: 100, width: 100 });

    editorRef.current = editor;

    // Bind a shortcut key to run current script
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      function () {
        // As currentServer isn't necessarily set when we bind this and this ends up out of scope we
        // can make the rest happen in React land by just triggering the click action on the play button.
        // Yes it's a hack, and I don't like it, but it works
        if (goRef && goRef.current) goRef.current.click();
      }
    );
  }

  // As we write scripts we need to update our store of them so we don't lose stuff when switching to
  // another server
  function updateScripts(newValue: string) {
    setCurrentScript(newValue);
    onUnsavedChangesChanged(newValue !== savedScript.current);
  }

  async function loadScript() {
    const result = await ipcRenderer.invoke("load-script");
    if (result) {
      const { data, filename } = result;
      setCurrentScript(data);
      savedScript.current = data;
      onUnsavedChangesChanged(false);
      editorRef.current?.setValue(data);
      onFilenameChanged(filename);
    }
  }

  async function saveScript() {
    const savedFilename = await ipcRenderer.invoke(
      "save-script",
      currentScript,
      filename
    );
    savedScript.current = currentScript;
    onUnsavedChangesChanged(false);
    onFilenameChanged(savedFilename);
  }

  async function saveScriptAs() {
    const savedFilename = await ipcRenderer.invoke(
      "save-script",
      currentScript
    );
    savedScript.current = currentScript;
    onUnsavedChangesChanged(false);
    onFilenameChanged(savedFilename);
  }

  // Send our commands to the server
  async function runScript() {
    let script = "";
    // Reset results to trigger loading animation
    let selected;

    // Get currently highlighted text
    if (editorRef.current) {
      const editor: IStandaloneCodeEditor = editorRef.current!;
      selected = editor.getModel()?.getValueInRange(editor.getSelection()!);
    }

    // If selected text use that, otherwise send full script
    script = selected && selected != "" ? selected : currentScript;

    // Load actual results
    onExecuteQuery(script);
  }

  // Set up our command bar items
  const items: ICommandBarItemProps[] = [
    {
      key: "go",
      title: "Run script",
      iconProps: { iconName: "Play" },
      disabled: !(currentScript && currentScript != ""),
      elementRef: goRef,
      className: "go-button",
      onClick: () => {
        runScript();
      },
    },
    {
      key: "open",
      title: "Open",
      iconProps: { iconName: "OpenFolderHorizontal" },
      className: "open-button",
      onClick: () => {
        loadScript();
      },
    },
    {
      key: "save-as",
      title: "Save As",
      iconProps: { iconName: "SaveAs" },
      disabled: !(currentScript && currentScript != ""),
      className: "save-as-button",
      onClick: () => {
        saveScriptAs();
      },
    },
    {
      key: "save",
      title: "Save",
      iconProps: { iconName: "Save" },
      disabled: !(currentScript && currentScript != "") || !filename,
      className: "save-button",
      onClick: () => {
        saveScript();
      },
    },
  ];

  const overflowItems: ICommandBarItemProps[] = [
    {
      key: "cut",
      text: "Cut",
      title: "Cut selected text",
      iconProps: { iconName: "Cut" },
      onClick: () => {
        editorRef.current?.focus();
        document.execCommand("cut");
      },
    },
    {
      key: "copy",
      text: "Copy",
      title: "Copy selected text",
      iconProps: { iconName: "Copy" },
      onClick: () => {
        editorRef.current?.focus();
        document.execCommand("copy");
      },
    },
    {
      key: "paste",
      text: "Paste",
      title: "Paste text from the clipboard",
      iconProps: { iconName: "Paste" },
      onClick: () => {
        editorRef.current?.focus();
        document.execCommand("paste");
      },
    },
    {
      key: "find",
      text: "Find",
      title: "Find text in script",
      iconProps: { iconName: "Search" },
      onClick: () => {
        editorRef.current?.focus();
        editorRef.current?.getAction("actions.find").run();
      },
    },
    {
      key: "replace",
      text: "Replace",
      title: "Replace text in script",
      iconProps: { iconName: "Switch" },
      onClick: () => {
        editorRef.current?.focus();
        editorRef.current
          ?.getAction("editor.action.startFindReplaceAction")
          .run();
      },
    },
  ];

  const rightItems: ICommandBarItemProps[] = [
    {
      key: "undo",
      title: "Undo last change",
      iconProps: { iconName: "Undo" },
      onClick: () => {
        editorRef.current?.trigger("aaaa", "undo", "aaaa");
        editorRef.current?.focus();
      },
    },
    {
      key: "redo",
      title: "Redo last change",
      iconProps: { iconName: "Redo" },
      onClick: () => {
        editorRef.current?.trigger("aaa", "redo", "aaa");
        editorRef.current?.focus();
      },
    },
  ];

  return (
    <Stack
      style={{
        ...editorWindow,
        backgroundColor: uiTheme.palette.white,
      }}
    >
      <CommandBar
        items={items}
        overflowItems={overflowItems}
        farItems={rightItems}
        style={{
          flex: "0",
        }}
      />
      <div ref={wrapper} style={editorWrapper}>
        <MonacoEditor
          language="kbd/q"
          theme={isDarkMode ? "vs-dark" : "vs-light"}
          options={editorOptions}
          editorWillMount={editorWillMount}
          editorDidMount={editorDidMount}
          onChange={updateScripts}
        />
      </div>
    </Stack>
  );
};

export default EditorWindow;
