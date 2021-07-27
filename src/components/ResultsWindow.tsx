import React, { FunctionComponent, useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { 
  CommandBar, 
  ConstrainMode, 
  DetailsList, 
  DetailsListLayoutMode,  
  IColumn, 
  ICommandBarItemProps,
  IDetailsListStyles,
  SelectionMode,
  Shimmer,
  Spinner,
  SpinnerSize,
  Stack,
} from "@fluentui/react"

import { resultsWindow } from '../style'
import { MainContext } from '../contexts/main'
import { ResultsProcessor } from '../results/processor'

const ResultsWindow:FunctionComponent = () => {

  const { 
    currentServer,
    results,
    isLoading, 
    setIsLoading
  } = useContext(MainContext)

  const [currentResults,setCurrentResults] = useState<any>(null)
  const [columns, setColumns] = useState<IColumn[]>([])
  const [rows, setRows] = useState<Array<{}|string>>([])
  //const [start, setStart] = useState(0)

  const startReducer = (state:{start:number}, action:{type:string, payload:number}) => {
    switch (action.type) {
      case 'SET_START':
        return {...state, start: action.payload}
      default:
        return state;
    }
  }
  const [start, startDispatch] = useReducer(startReducer, {start:0})

  const setStart = useCallback((index) => startDispatch({
    type: "SET_START",
    payload: index
  }), [startDispatch])

  useEffect(() => {

    if (currentServer && results[currentServer]) {
      setCurrentResults(results[currentServer])
    } else {
      setCurrentResults(null)
    }
    
    startDispatch({type: "SET_START", payload: 0})

  }, [currentServer, results])

  // Format the results for display (needs extracting out)
  useEffect(() => {

    if (results) {
      console.log("START", start)
      const processed = ResultsProcessor.process(currentResults, start.start)

      console.log("processed", processed)

      if (Array.isArray(processed)) {
        const [cols, rows] = processed as [Array<IColumn>, Array<{}>]

        setColumns(cols)
        setRows(rows)
      }
      setIsLoading(false)
    }

  }, [currentResults])

  useEffect(() => {
    console.log("UPDATED START", start)
    if (start.start > 0) {
      if (results) {
        const processed = ResultsProcessor.process(currentResults, start.start)
  
        if (Array.isArray(processed)) {
          const [_, newRows] = processed as [Array<IColumn>, Array<{}>]
  
          setRows([...rows.slice(0, rows.length - 1), ...newRows])
        }
      }
    }
  }, [start])

  const parseMoreResults = (index?: number) => {
    console.log("NEW START", index)
    startDispatch({type: "SET_START", payload: index || 0})
    return null//(<Shimmer isDataLoaded={false}></Shimmer>)
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
        )}
    </Stack>
  )
}

export default ResultsWindow