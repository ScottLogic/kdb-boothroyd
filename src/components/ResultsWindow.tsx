import React, { FunctionComponent } from 'react'
import { 
  CommandBar, 
  ICommandBarItemProps,
} from "@fluentui/react"

import { panel, resultsWindow } from '../style'

const ResultsWindow:FunctionComponent = () => {

  const items: ICommandBarItemProps[] = [
    {
      key: "excel",
      title: "Open in Excel",
      iconProps: { iconName: "ExcelLogo" },
      onClick: () => {
        console.log("EXCEL CLICKED")
      },
    },
    {
      key: "export",
      title: "Export result set",
      iconProps: { iconName: "Export" },
      onClick: () => {
        console.log("EXPORT CLICKED")
      },
      
    },
    {
      key: "chart",
      title: "Chart current result set",
      iconProps: { iconName: "AreaChart" },
      onClick: () => {
        console.log("CHART CLICKED")
      }
    }
  ]

  return (
    <div style={{
      ...panel,
      ...resultsWindow 
    }}>
      <CommandBar 
        items={items}
        style={{ flex: "0" }}/>
      <pre style={{ flex: "1 1 auto", margin: "0 5px" }}>//Execute query to get results</pre>
    </div>
  )
}

export default ResultsWindow