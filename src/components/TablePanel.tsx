import { Nav, INavLink, Stack, Text } from "@fluentui/react";
import React, {
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import KdbConnection from "../server/kdb-connection";

import { tablePanel, stackTokens } from "../style";

interface TabelPanelProps {
  onExecuteQuery: (query: string) => void;
  connection: KdbConnection;
}

const TablePanel: FunctionComponent<TabelPanelProps> = ({ onExecuteQuery, connection }) => {
  const [tables, setTables] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    // Split into seperate function to manage async
    updateTables();
  }, [connection]);

  const links = Object.keys(tables).map((t) => ({
    key: t,
    name: t,
    url: t,
    isExpanded: false,
    links: tables[t].map(
      (col) =>
        ({
          key: col,
          name: col,
        } as INavLink)
    ),
  }));

  const navLinkGroups = [
    {
      links,
    },
  ];

  // If we have a new connection we need to go grab the schema for it
  async function updateTables() {
    let tbls = {};

    // If we haven't already grabbed tables get them
    if ((connection && !tbls) || Object.keys(tables).length == 0) {
      setTables(await getTables());
    } else {
      setTables(tbls);
    }
  }

  async function getTables() {
    if (!connection) return {};

    const tbls: { [key: string]: string[] } = {};

    try {
      const results = await connection.send("tables[]");
      const data = results.data as string[];

      // Get the columns for each table
      for (let i = 0; i < data.length; i++) {
        const t = data[i];
        const results2 = await connection.send(`cols ${t}`);
        tbls[t] = results2.data as string[];
      }
    } catch (_) {
      console.log("COULDN'T GET TABLE LIST");
    }

    return tbls;
  }

  async function tableSelected(
    e?: React.MouseEvent<HTMLElement>,
    item?: INavLink
  ) {
    e && e.preventDefault();
    if (item && item.key && connection) {
      console.log("TABLES", tables);
      if (Object.keys(tables).includes(item.key)) {
        onExecuteQuery(item.key);
      }
    }
  }

  return (
    <>
      <Stack tokens={stackTokens} style={{
        ...tablePanel
      }}>
        { Object.keys(tables).length > 0 ? (
          <Nav
            onLinkClick={tableSelected}
            ariaLabel="Table List"
            groups={navLinkGroups}
          />
        ) : (
          <Text>No Tables</Text>
        )}
      </Stack>
    </>
  );
};

export default TablePanel;
