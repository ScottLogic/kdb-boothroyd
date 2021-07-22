import React, { FunctionComponent, useState } from 'react'
import ReactDom from "react-dom"
import electron from "electron"
import { IModalProps, IModalStyles, IStyle, Modal, ThemeProvider } from '@fluentui/react'
import { initializeIcons } from "@fluentui/font-icons-mdl2"
import { Provider } from 'react-redux'
import store from "./store/index"

import EditorWindow from './components/EditorWindow'
import ResultsWindow from './components/ResultsWindow'
import TablePanel from './components/TablePanel'
import ManageServers from './components/ManageServers'

import { container, serverModal } from './style'
import { darkTheme, lightTheme } from './themes'

initializeIcons()

const App:FunctionComponent = () => {

  const nativeTheme = electron.remote.nativeTheme
  const [currentTheme, setCurrentTheme] = useState((nativeTheme.shouldUseDarkColors) ? darkTheme : lightTheme)
  const [showServerModal, setShowServerModal] = useState(true)

  nativeTheme.on("updated", () => {
    setCurrentTheme((nativeTheme.shouldUseDarkColors) ? darkTheme : lightTheme)
  });

  function toggleServerModal(display:boolean) {
    setShowServerModal(display)
  }

  return (
    <Provider store={store}>
      <ThemeProvider applyTo="body" theme={currentTheme}>
        <Modal
          titleAriaId="Manage Servers"
          isOpen={showServerModal}
          styles={{ "main": serverModal as IStyle }}
          onDismiss={() => toggleServerModal(false)}
          isBlocking={true}
        >
          <ManageServers closeModal={() => toggleServerModal(false)}/>
        </Modal>
        <div style={container}>
          <TablePanel toggleServerModal={toggleServerModal}/>
          <EditorWindow/>
          <ResultsWindow/>
        </div>
      </ThemeProvider>
    </Provider>
  )
}

// Render React app
ReactDom.render(
  <App />, 
  document.getElementById('root')
);