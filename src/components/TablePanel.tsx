import { Stack, Text, useTheme, GroupedList, IGroupHeaderProps, IGroup, IconButton, ITextProps, ActionButton, FontIcon } from "@fluentui/react";
import React, {
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import KdbConnection from "../server/kdb-connection";
import { QColDict, QDataTypes, QMetaDict } from "../server/q-datatypes";

import { tablePanel, stackTokens, tableListIcon, tableListColumn, tableListName } from "../style";
import Result from "../types/results";

interface TabelPanelProps {
  onExecuteQuery: (query: string) => void;
  connection: KdbConnection;
  results: Result | undefined
}

const TablePanel: FunctionComponent<TabelPanelProps> = ({ 
  onExecuteQuery, 
  connection,
  results
}) => {
  const [tables, setTables] = useState<{ [key: string]: string[] }>({});
  const [columns, setColumns] = useState<string[]>([])
  const [groups, setGroups] = useState<IGroup[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    // Split into seperate function to manage async
    updateTables();
  }, [connection, results]);

  useEffect(() => {

    const cols:string[] = []
    const grps:IGroup[] = []

    Object.entries(tables).forEach(([k,v]) => {      
      grps.push({
        key: k,
        name: k,
        count: v.length,
        startIndex: cols.length,
        isCollapsed: true
      })
      cols.push(...v)
    })

    console.log("ITEMS", cols)
    console.log("GROUPS", grps)
    setColumns(cols)
    setGroups(grps)

  }, [tables])

  /*const links = Object.keys(tables).map((t) => ({
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
  ];*/

  // If we have a new connection we need to go grab the schema for it
  async function updateTables() {
    let tbls = {};

    // If we haven't already grabbed tables get them
    if (connection) {
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
        const results2 = await connection.send(`meta ${t}`);
        //tbls[t] = results2.data as string[];
        
        if (results2.type == "success") {
          const data2 = results2.data as Array<QColDict[]|QMetaDict[]>
          if (data2.length > 0) {
            let meta:QMetaDict[]
            if (data2.length > 1) {
              meta = data2[1] as QMetaDict[]
            }
            tbls[t] = (data2[0] as QColDict[]).map((c, i) => {
              let col = c.c

              if (meta && meta[i] && meta[i].t !== null) {
                col += ` (${QDataTypes[meta[i].t!]})`
              }

              return col
            })
          }
        }
        
      }
    } catch (_) {
      console.log("COULDN'T GET TABLE LIST");
    }

    return tbls;
  }

  const renderListCell = (nestingDepth?: number, item?: string, itemIndex?: number): React.ReactNode => {
          return item ? (
            <Stack horizontal={true} verticalAlign="center" style={tableListColumn}>
              <Text
                block
              >{item}</Text>
            </Stack>
          ) : null;
        },
        renderListHeader = (props?: IGroupHeaderProps): JSX.Element | null => {
          if (props) {
            const toggleCollapse = (): void => {
              props.onToggleCollapse!(props.group!);
            };
            const tableSelected = (): void => {
              onExecuteQuery(props.group!.name);
            }
            const isCollapsed = props.group!.isCollapsed
            return (
              <Stack 
                horizontal={true} 
                tokens={{
                  padding: "0 5"
                }}
                horizontalAlign="start" 
                verticalAlign="center"
                >
                <FontIcon 
                  iconName={(isCollapsed) ? "ChevronDown" : "ChevronUp"}
                  onClick={toggleCollapse}
                  style={tableListIcon}
                />
                <ActionButton
                  style={tableListName}
                  onClick={tableSelected}
                >
                    {props.group!.name}
                </ActionButton>
                <IconButton
                  iconProps={{iconName:"Play"}}
                  onClick={tableSelected}
                  style={tableListIcon}
                />
              </Stack>
            )
          }
        
          return null;
        }

  function togglePanel() {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      <Stack tokens={stackTokens} style={{
        ...tablePanel,
        backgroundColor: theme.palette.white,
        minWidth: (isCollapsed) ? "50px" : "200px" 
      }}>
        <Stack 
          horizontal={true} 
          horizontalAlign="start" 
          verticalAlign="center">
          {!isCollapsed && (
            <Text 
              block
              style={{flex:"1 1 auto"}}
              variant={"large" as ITextProps["variant"]}>
                Tables:
            </Text>
          )}
          <IconButton 
            style={{flex:"0"}}
            iconProps={{iconName: (isCollapsed) ?"OpenPaneMirrored" : "ClosePaneMirrored"}}
            onClick={togglePanel}
            />
        </Stack>
        
        {!isCollapsed && (
          <>
          { Object.keys(tables).length > 0 ? (
            <GroupedList
              items={columns}
              groups={groups}
              onRenderCell={renderListCell}
              groupProps={{
                onRenderHeader:renderListHeader
              }}
              
            />
          ) : (
            <Text>No Tables</Text>
          )}
        </>
        )}
      </Stack>
    </>
  );
};

export default TablePanel;
