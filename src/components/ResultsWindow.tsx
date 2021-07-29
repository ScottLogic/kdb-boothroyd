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
        const [cols, rows] = processed as [Array<IColumn>, Array<{}>]

        setColumns(cols)
        setRows(rows)
      }
      setIsLoading(false)
    } else if (error) {
      setIsLoading(false)
    }

  }, [currentResults, error])

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
              onRenderMissingItem={parseMoreResults}/>
            )}
          </>
          )
        )}
    </Stack>
  )
}

export default ResultsWindow