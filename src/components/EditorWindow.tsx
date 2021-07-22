import React, { FunctionComponent, useState } from 'react'
import MonacoEditor from 'react-monaco-editor';
import electron from 'electron'

import { 
  CommandBar, 
  ICommandBarItemProps,
} from "@fluentui/react"

import syntax from '../editor/syntax';
import theme from '../editor/theme';
import { editorWindow, panel } from '../style'

const EditorWindow:FunctionComponent = () => {

  const nativeTheme = electron.remote.nativeTheme
  let [isDarkMode, setIsDarkMode] = useState(nativeTheme.shouldUseDarkColors)

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

  const items: ICommandBarItemProps[] = [
    {
      key: "go",
      title: "Run script",
      iconProps: { iconName: "Play" },
      onClick: () => {
        console.log("GO CLICKED")
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
    <div style={ {...panel, ...editorWindow }}>
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
        value="([] c1:1000+til 100; c2:100?`a`b`c; c3:10*1+til 100)"
        options={editorOptions}
        editorWillMount={editorWillMount}
      />
    </div>
  )
}

export default EditorWindow