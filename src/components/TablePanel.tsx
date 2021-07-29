import { 
  CommandBar, 
  ICommandBarItemProps,
  Nav, 
  INavLink, 
  INavLinkGroup,
  Stack,
} from "@fluentui/react"
import React, { FunctionComponent, useContext, useEffect, useState } from "react"

import { tablePanel, stackTokens } from "../style"
import { MainContext } from "../contexts/MainContext"

type TablePanelProps = {
  toggleServerModal: (display:boolean) => void
}

const TablePanel:FunctionComponent<TablePanelProps> = ({toggleServerModal}:TablePanelProps) => {

  const context = useContext(MainContext)
  const currentServer = context.currentServer
  const connections = context.connections
  const updateResults = context.updateResults
  const setIsLoading = context.setIsLoading
  const results = context.results
  const [table, setTable] = useState<string | undefined>(undefined)
  const [navLinkGroups, setNavLinkGroups] = useState<INavLinkGroup[]>([])
  const [tables, setTables] = useState<{[key:string]: {[key:string]:string[]}}>({})

  useEffect(() => {

      // Split into seperate function to manage async
      updateTables()

  }, [connections])

  useEffect(() => {
    if (currentServer && connections[currentServer].isConnected()) {
      const refreshTables = async () => {
        const tbls = {...tables}
        tbls[currentServer] = await getTables(currentServer)
        setTables(tbls)
      }
      refreshTables()
    }
  }, [results])

  useEffect(() => {

    if (currentServer && tables[currentServer]) {
      // Create nested list of tables and columns
      const links = Object.keys(tables[currentServer]).map((t) => {
        return {
          key: t,
          name: t,
          url: t,
          isExpanded: false,
          links: tables[currentServer][t].map((c) => {
            return {
              key: c,
              name: c,
              url: c
            } as INavLink
          })
        }
      })
      
      setNavLinkGroups([
        {
          links
        }
      ])
    }
    
  }, [tables, currentServer])

  // If we have a new connection we need to go grab the schema for it
  async function updateTables() {

      const tbls = {...tables}

      // Loop over each connection
      for (let k in connections) {        
        // If we haven't already grabbed tables get them
        if (!tbls[k]) {
          tbls[k] = await getTables(k)
        }
      }

      setTables(tbls)
  }

  async function getTables(server:string) {
    const s = connections[server]
    const results = await s.send("tables[]")
    
    const tbls:{[key:string]: string[]} = {};
    const data = results.data as string[]

    // Get the columns for each table
    for (let i = 0; i < data.length; i++) {
      const t = data[i]
      const results2 = await s.send(`cols ${t}`)
      tbls[t] = results2.data as string[]
    }

    return tbls
  }

  const items: ICommandBarItemProps[] = [
    {
      key: "server",
      text: "Server",
      iconProps: { iconName: "Server" },
      onClick: () => {
        toggleServerModal(true)
      },
    }
  ]

  async function tableSelected(e?: React.MouseEvent<HTMLElement>, item?: INavLink) {
    e && e.preventDefault()
    if (item && item.key && currentServer) {
      console.log("TABLES", tables)
      if (Object.keys(tables[currentServer]).includes(item.key)) {
        setTable(item.key)

        //Reset results and show loading dialog
        setIsLoading(true)

        try {
          const res = await connections[currentServer].send(item.key)
          updateResults(currentServer, item.key, res.data)
        } catch (e) {
          updateResults(currentServer, item.key, null, e)
        }
      }
    }
  }

  return (
    <>
      <Stack tokens={stackTokens} style={{
        ...tablePanel
      }}>
        <CommandBar 
          items={items}
          style={{ gridRow: 1 }}/>
        <Nav
          onLinkClick={tableSelected}
          selectedKey={table}
          ariaLabel="Table List"
          groups={navLinkGroups}
        />
      </Stack>
    </>
  )
}

export default TablePanel