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
import { MainContext } from "../contexts/main"

type TablePanelProps = {
  toggleServerModal: (display:boolean) => void
}

const TablePanel:FunctionComponent<TablePanelProps> = ({toggleServerModal}:TablePanelProps) => {

  const context = useContext(MainContext)
  const currentServer = context.currentServer
  const connections = context.connections
  const updateResults = context.updateResults
  const [table, setTable] = useState<string | undefined>(undefined)
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

  async function tableSelected(e?: React.MouseEvent<HTMLElement>, item?: INavLink) {
    e && e.preventDefault()
    if (item && currentServer) {
      setTable(item.key)
      const res = await connections[currentServer!].send(item.key!)
      updateResults(currentServer, res.data)
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