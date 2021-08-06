import { FontIcon, Stack } from "@fluentui/react";
import React, { FC, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server"

import KdbConnection from "../server/kdb-connection";
import { grabberBar, stackTokens } from "../style";
import Result from "../types/results";
import EditorWindow from "./EditorWindow";
import ResultsWindow from "./ResultsWindow";
import TablePanel from "./TablePanel";
import Split from 'react-split'

type ServerInterfaceProps = {
  connection: KdbConnection;
  visible: boolean;
  filename?: string;
  onFilenameChanged: (scriptName: string) => void;
};

const ServerInterface: FC<ServerInterfaceProps> = ({
  connection,
  filename,
  onFilenameChanged,
  visible = false,
}: ServerInterfaceProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Result | undefined>();

  async function executeQuery(script: string) {
    if (connection && connection.isConnected()) {
      try {
        setIsLoading(true);
        const res = await connection.send(script);
        if (res.type == "success") {
          setResults({
            script,
            data: res.data,
          });
      } else if (res.type == "error") {
        setResults({
          script,
          data: null,
          error: res.data as string
        })
      }
      } catch (e) {
        setResults({
          script,
          data: null,
          error: e,
        });
      }
      setIsLoading(false);
    }
  }

  function renderGutter(_:number, direction:string) {
    const className = `gutter gutter-${direction}`
    const el = document.createElement("div")
    el.className = className
    el.style.textAlign = "center"
    el.style.cursor = "row-resize"

    el.innerHTML = renderToStaticMarkup(<FontIcon iconName="GripperBarHorizontal" style={{...grabberBar}}/>)
    return el
  }

  return (
    <Stack
      horizontal={true}
      tokens={stackTokens}
      style={{
        overflow:"hidden",
        flex: "1 1 auto",
        alignItems: "stretch",
        display: visible ? "flex" : "none",
      }}
    >
      <TablePanel 
        onExecuteQuery={executeQuery} 
        connection={connection} 
        results={results}
      />
      
      <Split
        direction="vertical"
        sizes={[40, 60]}
        gutterSize={10}
        gutter={renderGutter}
        style={{
          display:"flex",
          flexDirection: "column",
          flex: "1 1 auto", 
          alignItems: "stretch", 
          minWidth: 0 
        }}
        >
          <EditorWindow onExecuteQuery={executeQuery} onFilenameChanged={onFilenameChanged} filename={filename}/>
          <ResultsWindow
            results={results}
            isLoading={isLoading}
            onExecuteQuery={executeQuery}
          />
      </Split>
    </Stack>
  );
};

export default ServerInterface;
