import React, { createRef, FunctionComponent, useContext, useEffect, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor';
import { ipcRenderer } from 'electron'
import { 
  CommandBar, 
  ICommandBarItemProps,
  Stack,
} from "@fluentui/react"
import syntax from '../editor/syntax';
import theme from '../editor/theme';
import { editorWindow } from '../style'

interface EditorWindowProps {
  onExecuteQuery: (query:string) => void;
}

const EditorWindow:FunctionComponent<EditorWindowProps> = ({onExecuteQuery}) => {

  // Store a list of scripts against the server they're intended for
  const [currentScript, setCurrentScript] = useState("")

  // Find out if system is in dark mode so we can use the appropriate editor theme
  let [isDarkMode, setIsDarkMode] = useState(false)

  // Check current theme
  ipcRenderer
    .invoke("is-dark-mode")
    .then((isDarkMode) => {
      setIsDarkMode(isDarkMode)
    })
  
  // Handle theme updates
  ipcRenderer
    .on("colour-scheme-changed", (_, isDarkMode) => {
      setIsDarkMode(isDarkMode)
    })

  // Store a reference we can use to target the run script button
  const goRef = createRef<HTMLButtonElement>()

  // Store a ref to the editor
  const editorRef = useRef()

  useEffect(() => {
    window.addEventListener('resize', () => {
      if (editorRef.current)
        (editorRef.current as any).layout({height:"100%", width:"100%"})
    })
  },[])


  // Set some default options for the Monaco Editor
  const editorOptions = {
    minimap: {
      enabled: false
    },
    automaticLayout: true
  }

  // Before the editor mounts we need to register our q language
  function editorWillMount(monaco:any) {
    if (!monaco.languages.getLanguages().some(({ id }:any) => id === 'kbd/q')) {
      // Register a new language
      monaco.languages.register({ id: 'kbd/q' })
      // Register a tokens provider for the language
      monaco.languages.setMonarchTokensProvider('kbd/q', syntax)
      monaco.editor.defineTheme("kbd", theme)
    }
  }

  // Once the editor is mounted we can manipulate it a bit
  function editorDidMount(editor:any, monaco:any) {
    // Get round bug with editor and flex layouts where editor gets too big for it's boots, literally
    editor._domElement.style.maxWidth="100%"
    editor.layout()

    editorRef.current = editor
    // Bind a shortcut key to run current script
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
      // As currentServer isn't necessarily set when we bind this and this ends up out of scope we
      // can make the rest happen in React land by just triggering the click action on the play button.
      // Yes it's a hack, and I don't like it, but it works
      if (goRef && goRef.current)
        goRef.current.click()
    })
  }

  // As we write scripts we need to update our store of them so we don't lose stuff when switching to 
  // another server
  function updateScripts(newValue:string) {
    setCurrentScript(newValue)
  }

  // Send our commands to the server
  async function runScript() {
    let script = ""
    // Reset results to trigger loading animation
    let selected
    
    // Get currently highlighted text
    if (editorRef.current) {
      const editor:any = editorRef.current!
      selected = editor.getModel().getValueInRange(editor.getSelection())
    }

    // If selected text use that, otherwise send full script
    script = (selected && selected != "") ? selected : currentScript
    
    // Load actual results
    onExecuteQuery(script)
  }

  // Set up our command bar items
  const items: ICommandBarItemProps[] = [
    {
      key: "go",
      title: "Run script",
      iconProps: { iconName: "Play" },
      disabled: !(currentScript && currentScript != ""),
      elementRef: goRef,
      onClick: () => {
        runScript()
      }
    }
  ]

  const overflowItems: ICommandBarItemProps[] = [
    {
      key: "cut",
      text: "Cut",
      title: "Cut selected text",
      iconProps: { iconName: "Cut" },
      onClick: () => {
        if (editorRef && editorRef.current) {
          const editor = editorRef.current as any
          editor.focus()
          document.execCommand("cut")
        }
      }
    },
    {
      key: "copy",
      text: "Copy",
      title: "Copy selected text",
      iconProps: { iconName: "Copy" },
      onClick: () => {
        if (editorRef && editorRef.current) {
          const editor = editorRef.current as any
          editor.focus()
          document.execCommand("copy")
        }
      }
    },
    {
      key: "paste",
      text: "Paste",
      title: "Paste text from the clipboard",
      iconProps: { iconName: "Paste" },
      onClick: () => {
        if (editorRef && editorRef.current) {
          const editor = editorRef.current as any
          editor.focus()
          document.execCommand("paste")
        }
      }
    },
    {
      key: "find",
      text: "Find",
      title: "Find text in script",
      iconProps: { iconName: "Search"},
      onClick: () => {
        if (editorRef && editorRef.current) {
          const editor = editorRef.current as any
          editor.focus();
          editor.getAction("actions.find").run()
        }
      }
    },
    {
      key: "replace",
      text: "Replace",
      title: "Replace text in script",
      iconProps: { iconName: "Switch"},
      onClick: () => {
        if (editorRef && editorRef.current) {
          const editor = editorRef.current as any
          editor.focus();
          editor.getAction("editor.action.startFindReplaceAction").run()
        }
      }
    }
  ]

  const rightItems: ICommandBarItemProps[] = [
    {
      key: "undo",
      title: "Undo last change",
      iconProps: { iconName: "Undo" },
      onClick: () => {
        if (editorRef && editorRef.current) {
          const editor = (editorRef.current as any)
          editor.trigger('aaaa', 'undo', 'aaaa')
          editor.focus()
        }
      }
    },
    {
      key: "redo",
      title: "Redo last change",
      iconProps: { iconName: "Redo" },
      onClick: () => {
        if (editorRef && editorRef.current) {
          const editor = (editorRef.current as any)
          editor.trigger('aaa', 'redo', 'aaa')
          editor.focus()
        }
      }
    }
  ]


  return (
    <Stack style={ { ...editorWindow }}>
      <CommandBar 
          items={items}
          overflowItems={overflowItems}
          farItems={rightItems}
          style={{
            flex: "0" 
          }}/>
      <MonacoEditor
        language="kbd/q"
        theme={(isDarkMode) ? "vs-dark" : "vs-light"}
        options={editorOptions}
        editorWillMount={editorWillMount}
        editorDidMount={editorDidMount}
        onChange={updateScripts}
      />
    </Stack>
  )
}

export default EditorWindow