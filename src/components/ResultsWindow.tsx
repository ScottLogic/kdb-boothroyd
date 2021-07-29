import React, { FunctionComponent, useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { 
  CommandBar, 
  ConstrainMode, 
  DetailsList, 
  DetailsListLayoutMode,  
  IColumn, 
  ICommandBarItemProps,
  IContextualMenuItem,
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
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';

import { resultsWindow } from '../style'
import { MainContext } from '../contexts/MainContext'
import { ResultsProcessor } from '../results/processor'
import { ipcRenderer } from 'electron'
import Exporter, { ExportFormat } from '../results/exporter';

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

  ipcRenderer.on("download-complete", (_, file) => {
    Exporter.cleanup(file)
  })
              

  const parseMoreResults = (index?: number) => {
    setTimeout(() => {
      setStart(index || 0)
    }, 100)
    
    return (<Shimmer isDataLoaded={false}></Shimmer>)
  }

  function onColumnClick() {
    //TODO add sorting code
  }

  const farItems: ICommandBarItemProps[] = [
    /*{
      key: "excel",
      title: "Open in Excel",
      iconProps: { iconName: "ExcelLogo" },
      
      onClick: () => {
        
      },
    },*/
    {
      key: "export",
      text: "Export",
      title: "Export result set",
      iconProps: { iconName: "Export" },
      disabled: (!Array.isArray(currentResults) || currentResults.length == 0),
      subMenuProps: {
        onItemClick: (_, item?: IContextualMenuItem) => {
          if (item && item.key) {
            const file = Exporter.export(currentResults!,item.key as ExportFormat)
            if (file) {
              ipcRenderer.send("download", {
                url: file,
                properties: {
                  saveAs:true
                }
              })
            }
          }
        },
        items: [
          {
            key: ExportFormat.csv,
            text: "CSV (comma separated)",
            iconProps: getFileTypeIconProps({extension:"csv"})
          },
          {
            key: ExportFormat.txt,
            text: "TXT (tab separated)",
            iconProps: getFileTypeIconProps({extension:"txt"})
          },
          {
            key: ExportFormat.xml,
            text: "XML",
            iconProps: getFileTypeIconProps({extension:"xml"})
          },
          {
            key: ExportFormat.xlsx,
            text: "XLSX",
            iconProps: getFileTypeIconProps({extension:"xlsx"})
          }
        ]
      }
    },
    /*{
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