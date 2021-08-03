import { Stack } from "@fluentui/react";
import React, { FC, useState } from "react";
import KdbConnection from "../server/kdb-connection";
import { stackTokens } from "../style";
import Result from "../types/results";
import EditorWindow from "./EditorWindow";
import ResultsWindow from "./ResultsWindow";
import TablePanel from "./TablePanel";

type ServerInterfaceProps = {
  connection: KdbConnection;
  visible: boolean;
};

const ServerInterface: FC<ServerInterfaceProps> = ({
  connection,
  visible = false,
}: ServerInterfaceProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Result | undefined>();

  async function executeQuery(script: string) {
    if (connection && connection.isConnected()) {
      try {
        setIsLoading(true);
        const res = await connection.send(script);
        setResults({
          script,
          data: res.data,
        });
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

  return (
    <Stack
      horizontal={true}
      tokens={stackTokens}
      style={{
        maxHeight: "100%",
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
      <Stack style={{ flex: "1 1 auto", alignItems: "stretch", minWidth: 0 }}>
        <EditorWindow onExecuteQuery={executeQuery} />
        <ResultsWindow
          results={results}
          isLoading={isLoading}
          onExecuteQuery={executeQuery}
        />
      </Stack>
    </Stack>
  );
};

export default ServerInterface;
