import { 
  CommandBar, 
  ICommandBarItemProps,
  Nav, 
  INavLink, 
  INavLinkGroup,
  Stack,
  Text,
} from "@fluentui/react"
import React, { FunctionComponent, useContext, useEffect, useState } from "react"

import { tablePanel, stackTokens } from "../style"
import { ConnectionContext } from "../contexts/ConnectionContext"

const TablePanel:FunctionComponent = () => {

  const context = useContext(ConnectionContext)
  const connection = context.connection
  const performQuery = context.performQuery
  const results = context.results
  const [table, setTable] = useState<string | undefined>(undefined)
  const [navLinkGroups, setNavLinkGroups] = useState<INavLinkGroup[]>([])
  const [tables, setTables] = useState<{[key:string]:string[]}>({})

  useEffect(() => {

      // Split into seperate function to manage async
      updateTables()

  }, [connection])

  useEffect(() => {
    if (connection && connection.isConnected()) {
      const refreshTables = async () => {
        const tbls = await getTables()
        setTables(tbls)
      }
      refreshTables()
    }
  }, [results])

  useEffect(() => {

    if (tables) {
      // Create nested list of tables and columns
      const links = Object.keys(tables).map((t) => {
        return {
          key: t,
          name: t,
          url: t,
          isExpanded: false,
          links: tables[t].map((c) => {
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
    
  }, [tables])

  // If we have a new connection we need to go grab the schema for it
  async function updateTables() {

      let tbls = {}

      // If we haven't already grabbed tables get them
      if (connection && !tbls || Object.keys(tables).length == 0) {
        tbls = await getTables()
      }

      setTables(tbls)
  }

  async function getTables() {
    const s = connection

    if (!s)
      return {}

    const tbls:{[key:string]: string[]} = {};

    try {
      const results = await s.send("tables[]")
      const data = results.data as string[]

      // Get the columns for each table
      for (let i = 0; i < data.length; i++) {
        const t = data[i]
        const results2 = await s.send(`cols ${t}`)
        tbls[t] = results2.data as string[]
      }
    } catch (_) {
      console.log("COULDN'T GET TABLE LIST")
    }

    return tbls
  }

  async function tableSelected(e?: React.MouseEvent<HTMLElement>, item?: INavLink) {
    e && e.preventDefault()
    if (item && item.key && connection) {
      console.log("TABLES", tables)
      if (Object.keys(tables).includes(item.key)) {
        setTable(item.key)
        performQuery(item.key)
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
            selectedKey={table}
            ariaLabel="Table List"
            groups={navLinkGroups}
          />
        ) : (
          <Text>No Tables</Text>
        )}
      </Stack>
    </>
  )
}

export default TablePanel