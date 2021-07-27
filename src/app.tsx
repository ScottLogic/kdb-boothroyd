import React, { FunctionComponent, useState } from 'react'
import ReactDom from "react-dom"
import electron from "electron"
import { ThemeProvider } from '@fluentui/react'
import { initializeIcons } from "@fluentui/font-icons-mdl2"

import { darkTheme, lightTheme } from './themes'
import MainInterface from './components/MainInterface'
import { initStorage } from './storage/storage'

initializeIcons()
initStorage()

const App:FunctionComponent = () => {

  const nativeTheme = electron.remote.nativeTheme
  const [currentTheme, setCurrentTheme] = useState((nativeTheme.shouldUseDarkColors) ? darkTheme : lightTheme)

  nativeTheme.on("updated", () => {
    setCurrentTheme((nativeTheme.shouldUseDarkColors) ? darkTheme : lightTheme)
  });

  return (
    <ThemeProvider applyTo="body" theme={currentTheme}>
      <MainInterface/>
    </ThemeProvider>
  )
}

// Render React app
ReactDom.render(
  <App />, 
  document.getElementById('root')
);