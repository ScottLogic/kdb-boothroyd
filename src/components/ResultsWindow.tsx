import React, { FunctionComponent, useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { 
  CommandBar, 
  ConstrainMode, 
  DetailsList, 
  DetailsListLayoutMode,  
  IColumn, 
  ICommandBarItemProps,
  IDetailsListStyles,
  ITextProps,
  MessageBar,
  MessageBarType,
  SelectionMode,
  Shimmer,
  Spinner,
  SpinnerSize,
  Stack,
  Text,
} from "@fluentui/react"

import { resultsWindow } from '../style'
import { MainContext } from '../contexts/MainContext'
import { ResultsProcessor } from '../results/processor'
import { ipcRenderer } from 'electron'

enum ResultsView {
  Table,
  Raw
}

const ResultsWindow:FunctionComponent = () => {

  const { 
    currentServer,
    results,
    isLoading, 
    setIsLoading
  } = useContext(MainContext)

  const [currentResults,setCurrentResults] = useState<any>(null)
  const [currentScript, setCurrentScript] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [columns, setColumns] = useState<IColumn[]>([])
  const [rows, setRows] = useState<Array<{}|string>>([])
  const [start, setStart] = useState(0)
  const [currentView, setCurrentView] = useState(ResultsView.Raw)
  const [viewOptions, setViewOptions] = useState<ICommandBarItemProps[]>([])

  useEffect(() => {

    if (currentServer && results[currentServer]) {
      const r = results[currentServer]
      setCurrentScript(r.script)
      setError(r.error)
      setCurrentResults(r.data)
    } else {
      setCurrentScript(undefined)
      setError(undefined)
      setCurrentResults(null)
    }
    
    setStart(0)

  }, [currentServer, results])

  // Format the results for display (needs extracting out)
  useEffect(() => {

    if (currentResults) {
      const processed = ResultsProcessor.process(currentResults, start)

      if (Array.isArray(processed)) {
        setCurrentView(ResultsView.Table)
        const [cols, rows] = processed as [Array<IColumn>, Array<{}>]

        setColumns(cols)
        setRows(rows)
      } else {
        setColumns([])
        setRows([])
      }
      setIsLoading(false)
    } else if (error) {
      setIsLoading(false)
    }

  }, [currentResults, error])

  useEffect(() => {

    if (rows.length > 0) {
      setViewOptions([
        {
          key: "table",
          text: "Table",
          iconProps: { iconName: "Table" },
          checked: (currentView == ResultsView.Table),
          onClick: () => {
            setCurrentView(ResultsView.Table)
          }
        },
        {
          key: "text",
          text: "Raw",
          iconProps: { iconName: "RawSource" },
          checked: (currentView == ResultsView.Raw),
          onClick: () => {
            setCurrentView(ResultsView.Raw)
          }
        }
      ])
    } else {
      setViewOptions([])
    }

  }, [currentView, rows])

  useEffect(() => {
    if (start > 0) {
      if (results) {
        const processed = ResultsProcessor.process(currentResults, start)
  
        if (Array.isArray(processed)) {
          const [_, newRows] = processed as [Array<IColumn>, Array<{}>]
  
          setRows([...rows.slice(0, rows.length - 1), ...newRows])
        }
      }
    }
  }, [start])

  const parseMoreResults = (index?: number) => {
    setTimeout(() => {
      setStart(index || 0)
    }, 100)
    
    return (<Shimmer isDataLoaded={false}></Shimmer>)
  }

  function onColumnClick() {
    //TODO add sorting code
  }

  const items: ICommandBarItemProps[] = [
    
  ]

  const farItems: ICommandBarItemProps[] = [
    {
      key: "excel",
      title: "Open in Excel",
      iconProps: { iconName: "ExcelLogo" },
      disabled: (!Array.isArray(currentResults) || currentResults.length == 0),
      onClick: () => {
        let csvContent = "data:text/csv;charset=utf-8,"

        if (typeof currentResults[0] === "object") {
          const keys = Object.keys(currentResults[0]) as string[]
          csvContent += keys.join(",") + "\n"

          console.log("KEYS", keys)
          csvContent += currentResults.map((r:{[key:string]:any}) => {
            const cols:any[] = []
            keys.forEach((k) => {
              cols.push(r[k])
            })

            console.log("COLS", cols)

            return cols.join(",")
          }).join("\n")
        } else {
          csvContent += currentResults.join("\n")
        }

        ipcRenderer.send("download", {
          url: csvContent,
          properties: {
            saveAs:true
          }
        })
      },
    },
    /*{
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
    }*/
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
        items={viewOptions}
        farItems={farItems}
        style={{ flex: "0" }}/>
        {(isLoading ) ? (
          <Spinner size={SpinnerSize.large}/>
        ) : (
          (error) ? (
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline={true}
              >
              <Text block variant={"large" as ITextProps['variant']}>Error when executing query</Text>
              <br/>
              <Text block>Query: {currentScript}</Text>
              <Text block>{error}</Text>
            </MessageBar>
          ) : (
          <>
            {(typeof currentResults === "string" || currentView == ResultsView.Raw) ? (
              <pre>{currentResults ? JSON.stringify(currentResults,null,2) : ""}</pre>
            ): (
            <DetailsList
              columns={columns}
              items={rows}
              styles={gridStyles}
              layoutMode={DetailsListLayoutMode.fixedColumns}
              constrainMode={ConstrainMode.unconstrained}
              selectionMode={SelectionMode.none}
              onRenderMissingItem={parseMoreResults}/>
            )}
          </>
          )
        )}
    </Stack>
  )
}

export default ResultsWindow