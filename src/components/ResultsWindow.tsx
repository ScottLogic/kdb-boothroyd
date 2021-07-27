import React, { FunctionComponent, useContext, useEffect, useState } from 'react'
import { 
  CommandBar, 
  ConstrainMode, 
  DetailsList, 
  DetailsListLayoutMode,  
  IColumn, 
  ICommandBarItemProps,
  IDetailsListStyles,
  SelectionMode,
  Stack,
} from "@fluentui/react"

import { resultsWindow } from '../style'
import { MainContext } from './MainInterface'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const ResultsWindow:FunctionComponent = () => {

  const context = useContext(MainContext)
  const currentServer = context.currentServer
  const results = useSelector((state:RootState) => state.servers.results[currentServer!])
  const [columns, setColumns] = useState<IColumn[]>([])
  const [rows, setRows] = useState<Array<{}|string>>([])

  useEffect(() => {
    const cols:IColumn[] = []
    const data:{}[] = []

    console.log("results", results)
    if (results && typeof results != "string") {
      if (results.length > 0) {
        // Add index column
        cols.push({
          key: "index",
          name: "",
          fieldName:"|i|",
          minWidth:10,
          maxWidth:50,
          isRowHeader: true,
          isResizable: true,
          isSorted: false,
          isSortedDescending: false,
          sortAscendingAriaLabel: 'Sorted ASC',
          sortDescendingAriaLabel: 'Sorted DESC',
          onColumnClick: onColumnClick,
          data: Number,
          isPadded: true
        })

        if (typeof results[0] === typeof {}) { 

          Object.entries(results[0]).forEach(([k,v]) => {
            cols.push({
              key: k.toLowerCase(),
              name: k.toUpperCase(),
              fieldName: k,
              minWidth:10,
              maxWidth:200,
              isRowHeader: false,
              isResizable: true,
              isSorted: false,
              isSortedDescending: false,
              sortAscendingAriaLabel: 'Sorted ASC',
              sortDescendingAriaLabel: 'Sorted DESC',
              onColumnClick: onColumnClick,
              data: typeof v,
              isPadded: true
            } as IColumn)
          })

          results.forEach((v:{}, i:number) =>{
            data.push({
              ...v,
              "|i|": i + 1
            })
          })
          // Left in but commented out for testing against scrolling resultsets
          /*results.forEach((v, i) =>{
            const row:{[key: string]: any} = v as {}
            row["|i|"] = i+1
            console.log("row", row)
            data.push(row)
          })
          results.forEach((v, i) =>{
            const row:{[key: string]: any} = v as {}
            row["|i|"] = i+1
            console.log("row", row)
            data.push(row)
          })*/
        } else {
          cols.push({
            key: "value",
            name: "Value",
            fieldName:"value",
            minWidth:10,
            maxWidth:200,
            isRowHeader: true,
            isResizable: true,
            isSorted: false,
            isSortedDescending: false,
            sortAscendingAriaLabel: 'Sorted ASC',
            sortDescendingAriaLabel: 'Sorted DESC',
            onColumnClick: onColumnClick,
            data: typeof results[0],
            isPadded: true
          })
          results.forEach((v:any,i:number) => {
            data.push({
              value:v,
              "|i|":i+1
            })
          })
        }
      }
    }
    setColumns(cols)
    setRows(data)
  }, [results])

  function onColumnClick() {
    //TODO add sorting code
  }

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

  const gridStyles: Partial<IDetailsListStyles> = {
    root: {
      overflowX: 'scroll',
      selectors: {
        '& [role=grid]': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          height:"100%"
        },
      },
    },
    headerWrapper: {
      flex: '0 0 auto',
    },
    contentWrapper: {
      flex: '1 1 auto',
      overflowY: 'auto',
      overflowX: 'hidden',
    },
  };

  return (
    <Stack style={{
      ...resultsWindow,
      position:"relative"
    }}>
      <CommandBar 
        items={items}
        style={{ flex: "0" }}/>
        {(typeof results === "string") ? (
          <pre>{results}</pre>
        ): (
        <DetailsList
          columns={columns}
          items={rows}
          styles={gridStyles}
          layoutMode={DetailsListLayoutMode.fixedColumns}
          constrainMode={ConstrainMode.unconstrained}
          selectionMode={SelectionMode.none}
          />
        )}
    </Stack>
  )
}

export default ResultsWindow