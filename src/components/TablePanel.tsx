import { 
  CommandBar, 
  ICommandBarItemProps,
  Nav, 
  INavLink, 
  INavLinkGroup,
  Stack,
} from "@fluentui/react"
import React, { FunctionComponent, useContext, useEffect, useState } from "react"

import { panel, serverPanel, stackTokens } from "../style"
import { useSelector } from "react-redux"
import { RootState } from "../store"
import KdbConnection from "../server/kdb-connection"
import { MainContext } from "./MainInterface"

type TablePanelProps = {
  toggleServerModal: (display:boolean) => void
}

const TablePanel:FunctionComponent<TablePanelProps> = ({toggleServerModal}:TablePanelProps) => {

  const context = useContext(MainContext)
  const currentServer = context.currentServer
  const connections = context.connections
  const [table, setTable] = useState<string | undefined>(undefined)
  const servers = useSelector((state:RootState) => state.servers.servers)
  const connectedServers = useSelector((state:RootState) => state.servers.connectedServers)
  const [navLinkGroups, setNavLinkGroups] = useState<INavLinkGroup[]>([])
  const [tables, setTables] = useState<{[key:string]: {[key:string]:string[]}}>({})

  useEffect(() => {

      // Split into seperate function to manage async
      updateTables()

  }, [connections])

  useEffect(() => {

    if (currentServer && tables[currentServer]) {
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

  async function updateTables() {

      const tbls = {...tables}

      // Loop over each connection
      for (let k in connections) {
        const s = connections[k]
        
        // If we haven't already grabbed tables get them
        if (!tbls[k]) {
          const results = await s.send("tables[]")
          tbls[k] = {};
          const data = results.data as string[]

          // Get the columns for each table
          for (let i = 0; i < data.length; i++) {
            const t = data[i]
            const results2 = await s.send(`cols ${t}`)
            tbls[k][t] = results2.data as string[]
          }
        }
      }

      setTables(tbls)
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

  function tableSelected(e?: React.MouseEvent<HTMLElement>, item?: INavLink) {
    e && e.preventDefault()
    if (item) {
      setTable(item.key)
    }
  }

  return (
    <>
      <Stack tokens={stackTokens} style={{
        ...panel,
        ...serverPanel
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