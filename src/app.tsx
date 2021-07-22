import React, { FunctionComponent, useState } from 'react'
import ReactDom from "react-dom"
import electron from "electron"
import { ThemeProvider } from '@fluentui/react'
import { initializeIcons } from "@fluentui/font-icons-mdl2"
import { Provider } from 'react-redux'
import store from "./store/index"

import { darkTheme, lightTheme } from './themes'
import MainInterface from './components/MainInterface'

initializeIcons()

const App:FunctionComponent = () => {

  const nativeTheme = electron.remote.nativeTheme
  const [currentTheme, setCurrentTheme] = useState((nativeTheme.shouldUseDarkColors) ? darkTheme : lightTheme)

  nativeTheme.on("updated", () => {
    setCurrentTheme((nativeTheme.shouldUseDarkColors) ? darkTheme : lightTheme)
  });

  return (
    <Provider store={store}>
      <ThemeProvider applyTo="body" theme={currentTheme}>
        <MainInterface/>
      </ThemeProvider>
    </Provider>
  )
}

// Render React app
ReactDom.render(
  <App />, 
  document.getElementById('root')
);