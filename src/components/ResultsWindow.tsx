import React, { FunctionComponent, useEffect, useState } from "react";
import {
  CommandBar,
  IColumn,
  ICommandBarItemProps,
  IContextualMenuItem,
  ITextProps,
  MessageBar,
  MessageBarType,
  Shimmer,
  Spinner,
  SpinnerSize,
  Stack,
  Text,
  useTheme,
} from "@fluentui/react";
import { getFileTypeIconProps } from "@fluentui/react-file-type-icons";
import { AgGridReact } from "ag-grid-react";
import { GridReadyEvent, GridApi } from "ag-grid-community";
import { ipcRenderer } from "electron";

import {
  agWrapper,
  resultsWindow,
  resultsWrapper,
  stackTokens,
} from "../style";
import { ResultsProcessor } from "../results/processor";
import Exporter, { ExportFormat } from "../results/exporter";
import Result from "../types/results";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";

enum ResultsView {
  Table,
  Raw,
}

interface ResultsWindowProps {
  results: Result | undefined;
  isLoading: boolean;
  onExecuteQuery: (query: string) => void;
}

const ResultsWindow: FunctionComponent<ResultsWindowProps> = ({
  results,
  isLoading,
  onExecuteQuery,
}) => {
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [rows, setRows] = useState<Array<{} | string>>([]);
  const [currentView, setCurrentView] = useState(ResultsView.Raw);
  const [viewOptions, setViewOptions] = useState<ICommandBarItemProps[]>([]);
  const [gridAPI, setGridAPI] = useState<GridApi | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = useTheme();

  // Check current theme
  ipcRenderer.invoke("is-dark-mode").then((isDarkMode) => {
    setIsDarkMode(isDarkMode);
  });

  const currentResults = results?.data;
  const error = results?.error;
  const currentScript = results?.script;

  // Format the results for display (needs extracting out)
  useEffect(() => {
    if (currentResults) {
      const processed = ResultsProcessor.process(currentResults);

      if (Array.isArray(processed)) {
        setCurrentView(ResultsView.Table);
        const [cols, rows] = processed as [Array<IColumn>, Array<{}>];

        setColumns(cols);
        setRows(rows);
      }
    }
  }, [currentResults, error]);

  useEffect(() => {
    if (Array.isArray(currentResults) && currentResults.length > 0) {
      setViewOptions([
        {
          key: "table",
          text: "Table",
          iconProps: { iconName: "Table" },
          className: "table-view-tab",
          checked: currentView == ResultsView.Table,
          onClick: () => {
            setCurrentView(ResultsView.Table);
          },
        },
        {
          key: "text",
          text: "Raw",
          iconProps: { iconName: "RawSource" },
          className: "raw-view-tab",
          checked: currentView == ResultsView.Raw,
          onClick: () => {
            setCurrentView(ResultsView.Raw);
          },
        },
      ]);
    } else {
      setViewOptions([]);
    }
  }, [currentView, currentResults]);

  useEffect(() => {
    ipcRenderer.on("download-complete", (_, file) => {
      Exporter.cleanup(file);
    });

    return () => {
      ipcRenderer.removeAllListeners("download-complete");
    };
  }, []);

  const farItems: ICommandBarItemProps[] = [
    {
      key: "refresh",
      iconProps: { iconName: "Refresh" },
      disabled: !(results && results.data),
      onClick: () => {
        onExecuteQuery(results!.script);
      },
    },
    {
      key: "excel",
      title: "Open in Excel",
      iconProps: { iconName: "ExcelLogo" },
      disabled: !currentResults || currentResults.length == 0,
      onClick: () => {
        const file = Exporter.export(currentResults!, ExportFormat.xlsx);
        if (file) {
          ipcRenderer.send("open-file", {
            url: file,
          });
        }
      },
    },
    {
      key: "export",
      text: "Export",
      title: "Export result set",
      iconProps: { iconName: "Export" },
      disabled: !currentResults || currentResults.length == 0,
      subMenuProps: {
        onItemClick: (_, item?: IContextualMenuItem) => {
          if (item && item.key) {
            const file = Exporter.export(
              currentResults!,
              item.key as ExportFormat
            );
            if (file) {
              ipcRenderer.send("download", {
                url: file,
                properties: {
                  saveAs: true,
                },
              });
            }
          }
        },
        items: [
          {
            key: ExportFormat.csv,
            text: "CSV (comma separated)",
            iconProps: getFileTypeIconProps({ extension: "csv" }),
          },
          {
            key: ExportFormat.txt,
            text: "TXT (tab separated)",
            iconProps: getFileTypeIconProps({ extension: "txt" }),
          },
          {
            key: ExportFormat.xml,
            text: "XML",
            iconProps: getFileTypeIconProps({ extension: "xml" }),
          },
          {
            key: ExportFormat.xlsx,
            text: "XLSX",
            iconProps: getFileTypeIconProps({ extension: "xlsx" }),
          },
        ],
      },
    },
  ];

  function onGridReady(e: GridReadyEvent) {
    setGridAPI(e.api);
  }

  function refreshCells() {
    gridAPI?.refreshCells();
  }

  function stringify(data: any) {
    if (Array.isArray(data) && data.length > 10) {
      const chunk = data.slice(0, 10);
      const str = JSON.stringify(chunk, null, 2);
      return str.replace(/]$/, "  ...\n]");
    }
    return JSON.stringify(data, null, 2);
  }

  return (
    <Stack
      style={{
        ...resultsWindow,
        backgroundColor: theme.palette.white,
      }}
    >
      <CommandBar
        items={viewOptions}
        farItems={farItems}
        style={{ flex: "0" }}
      />
      <Stack tokens={stackTokens} style={resultsWrapper}>
        {isLoading ? (
          <Spinner size={SpinnerSize.large} />
        ) : error ? (
          <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
            <Text
              block
              variant={"large" as ITextProps["variant"]}
              style={{ color: "inherit" }}
            >
              Error when executing query
            </Text>
            <br />
            <Text block style={{ color: "inherit" }}>
              Query: {currentScript}
            </Text>
            <Text block style={{ color: "inherit" }}>
              {error}
            </Text>
          </MessageBar>
        ) : error ? (
          <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
            <Text
              block
              variant={"large" as ITextProps["variant"]}
              style={{ color: "inherit" }}
            >
              Error when executing query
            </Text>
            <br />
            <Text block style={{ color: "inherit" }}>
              Query: {currentScript}
            </Text>
            <Text block style={{ color: "inherit" }}>
              {error}
            </Text>
          </MessageBar>
        ) : (
          <>
            {typeof currentResults === "string" ||
            currentView == ResultsView.Raw ? (
              <pre className="raw-results-view">
                {currentResults ? stringify(currentResults) : ""}
              </pre>
            ) : (
              <div
                className={`table-results-view ag-theme-balham${
                  isDarkMode ? "-dark" : ""
                }`}
                style={agWrapper}
              >
                <AgGridReact
                  rowData={rows}
                  columnDefs={columns}
                  onGridReady={onGridReady}
                  onSortChanged={refreshCells}
                  onFilterChanged={refreshCells}
                  applyColumnDefOrder={true}
                  defaultColDef={{
                    width: 120,
                    sortable: true,
                    resizable: true,
                    filter: true,
                  }}
                />
              </div>
            )}
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default ResultsWindow;
