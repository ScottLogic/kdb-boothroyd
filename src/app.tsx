import React, { FunctionComponent } from 'react'
import ReactDom from "react-dom";
import EditorWindow from './components/EditorWindow'
import ResultsWindow from './components/ResultsWindow'
import ServerPanel from './components/ServerPanel'
import { container } from './style'

import { initializeIcons } from "@fluentui/font-icons-mdl2";

initializeIcons()

const App:FunctionComponent = () => {

  return (
    <div style={container}>
      <ServerPanel/>
      <EditorWindow/>
      <ResultsWindow/>
    </div>
  )
}

// Render React app
ReactDom.render(
  <App />, 
  document.getElementById('root')
);