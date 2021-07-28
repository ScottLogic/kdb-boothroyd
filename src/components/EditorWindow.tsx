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

  // Get properties from MainContext
  const context = useContext(MainContext)
  const currentServer = context.currentServer
  const connections = context.connections
  const updateResults = context.updateResults
  const results = context.results

  const setIsLoading = context.setIsLoading

  // Store a list of scripts against the server they're intended for
  const [scripts, setScripts] = useState<{[key:string]:string}>({})
  const [currentScript, setCurrentScript] = useState("")

  // Find out if system is in dark mode so we can use the appropriate editor theme
  const nativeTheme = electron.remote.nativeTheme
  let [isDarkMode, setIsDarkMode] = useState(nativeTheme.shouldUseDarkColors)

  // Store a reference we can use to target the run script button
  const goRef = createRef<HTMLButtonElement>()

  // Store a ref to the editor
  const editorRef = useRef()

  // If current script changes switch out script in editor
  useEffect(() => {
    if (currentServer) {
      const script = scripts[currentServer] || ""
      setCurrentScript(script)
      if (editorRef && editorRef.current)
        (editorRef.current as any).setValue(script)
    }
  }, [currentServer])

  // Toggled editor theme to match system theme
  nativeTheme.on("updated", () => {
    setIsDarkMode(nativeTheme.shouldUseDarkColors)
  });

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
    const list = {...scripts}
    list[currentServer!] = newValue
    setScripts(list)
    setCurrentScript(newValue)
  }

  // Send our commands to the server
  async function runScript() {
    if (currentServer) {
      try {
        // Reset results to trigger loading animation
        setIsLoading(true)

        let selected
        
        // Get currently highlighted text
        if (editorRef.current) {
          const editor:any = editorRef.current!
          selected = editor.getModel().getValueInRange(editor.getSelection())
        }

        // If selected text use that, otherwise send full script
        const script = (selected && selected != "") ? selected : currentScript
        
        // Load actual results
        const res = await connections[currentServer].send(script)
        
        updateResults(currentServer, script, res.data)
      } catch (e) {
        // TODO: handle error
      }
    }
  }

  async function refreshResults() {
    if (currentServer) {
      try {
        const script = results[currentServer].script
        const res = await connections[currentServer].send(script)
        updateResults(currentServer, script, res.data)
      } catch (e) {}
    }
  }

  // Set up our command bar items
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
      disabled: !(currentServer && results[currentServer]),
      onClick: () => {
        refreshResults()
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