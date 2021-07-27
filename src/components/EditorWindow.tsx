import React, { createRef, FunctionComponent, useContext, useEffect, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor';
import electron from 'electron'

import { 
  CommandBar, 
  ICommandBarItemProps,
  Stack,
} from "@fluentui/react"

import syntax from '../editor/syntax';
import theme from '../editor/theme';
import { editorWindow } from '../style'
import ResultsWindow from './ResultsWindow';
import { MainContext } from '../contexts/main';

const EditorWindow:FunctionComponent = () => {

  const context = useContext(MainContext)
  const currentServer = context.currentServer
  const connections = context.connections
  const updateResults = context.updateResults

  const [scripts, setScripts] = useState<{[key:string]:string}>({})
  const [currentScript, setCurrentScript] = useState("")
  const nativeTheme = electron.remote.nativeTheme
  let [isDarkMode, setIsDarkMode] = useState(nativeTheme.shouldUseDarkColors)

  const goRef = createRef<HTMLButtonElement>()
  useEffect(() => {
    if (currentServer)
      setCurrentScript(scripts[currentServer] || "")
  }, [currentServer])

  nativeTheme.on("updated", () => {
    setIsDarkMode(nativeTheme.shouldUseDarkColors)
  });

  const editorOptions = {
    minimap: {
      enabled: false
    },
    automaticLayout: true
  }

  function editorWillMount(monaco:any) {
    if (!monaco.languages.getLanguages().some(({ id }:any) => id === 'kbd/q')) {
      // Register a new language
      monaco.languages.register({ id: 'kbd/q' })
      // Register a tokens provider for the language
      monaco.languages.setMonarchTokensProvider('kbd/q', syntax)
      monaco.editor.defineTheme("kbd", theme)
    }
  }

  function editorDidMount(editor:any, monaco:any) {
    editor._domElement.style.maxWidth="100%"
    editor.layout()
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
      if (goRef && goRef.current)
        goRef.current.click()
    })
  }

  function updateScripts(newValue:string) {
    const list = {...scripts}
    list[currentServer!] = newValue
    setScripts(list)
    setCurrentScript(newValue)
  }

  async function runScript() {
    if (currentServer) {
      try {
        const res = await connections[currentServer].send(currentScript)
       updateResults(currentServer, res.data)
      } catch (e) {}
    }
  }

  const items: ICommandBarItemProps[] = [
    {
      key: "go",
      title: "Run script",
      iconProps: { iconName: "Play" },
      elementRef: goRef,
      onClick: () => {
        runScript()
      }
    },
    {
      key: "stop",
      title: "Stop script",
      iconProps: { iconName: "Stop" },
      onClick: () => {
        console.log("STOP CLICKED")
      }
    },
    {
      key: "refresh",
      title: "Refresh results",
      iconProps: { iconName: "Refresh" },
      onClick: () => {
        console.log("REFRESH CLICKED")
      }
    },
    
  ]

  const overflowItems: ICommandBarItemProps[] = [
    {
      key: "cut",
      text: "Cut",
      title: "Cut selected text",
      iconProps: { iconName: "Cut" },
      onClick: () => {
        console.log("CUT CLICKED")
      }
    },
    {
      key: "copy",
      text: "Copy",
      title: "Copy selected text",
      iconProps: { iconName: "Copy" },
      onClick: () => {
        console.log("COPY CLICKED")
      }
    },
    {
      key: "paste",
      text: "Paste",
      title: "Paste text from the clipboard",
      iconProps: { iconName: "Paste" },
      onClick: () => {
        console.log("PASTE CLICKED")
      }
    },
    {
      key: "find",
      text: "Find",
      title: "Find text in script",
      iconProps: { iconName: "Search"},
      onClick: () => {
        console.log("FIND CLICKED")
      }
    },
    {
      key: "replace",
      text: "Replace",
      title: "Replace text in script",
      iconProps: { iconName: "Switch"},
      onClick: () => {
        console.log("REPLACE CLICKED")
      }
    }
  ]

  const rightItems: ICommandBarItemProps[] = [
    {
      key: "undo",
      title: "Undo last change",
      iconProps: { iconName: "Undo" },
      onClick: () => {
        console.log("UNDO CLICKED")
      }
    },
    {
      key: "redo",
      title: "Redo last change",
      iconProps: { iconName: "Redo" },
      onClick: () => {
        console.log("REDO CLICKED")
      }
    }
  ]


  return (
    <>
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
          value={currentScript}
          options={editorOptions}
          editorWillMount={editorWillMount}
          editorDidMount={editorDidMount}
          onChange={updateScripts}
        />
      </Stack>
      <ResultsWindow />
    </>
  )
}

export default EditorWindow