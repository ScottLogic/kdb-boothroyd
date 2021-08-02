import { CommandBar, ICommandBarItemProps, IStyle, Modal, Pivot, PivotItem, Stack } from '@fluentui/react'
import React, { FC, useEffect, useState } from 'react'
import KdbConnection from '../server/kdb-connection'
import uuid from "uuid"

import { container, pivots, serverModal, stackTokens } from '../style'
import ManageServers from './ManageServers'
import Server, { SERVER_PREFIX } from '../types/server'
import { deleteItem, getItems, saveItem } from '../storage/storage'
import ServerInterface from './ServerInterface'
import { ManageServersContext } from '../contexts/ManageServersContext'

const MainInterface:FC = () => {

  const [showServerModal, setShowServerModal] = useState(true)
  const [servers, setServers] = useState<{[key: string]: Server}>({})
  const [currentServer, setCurrentServer] = useState<string | undefined>(undefined)
  const [connections, setConnections] = useState<{[key: string]:KdbConnection}>({})
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | undefined>()

  useEffect(() => {
    loadServers()
  }, [])

  async function loadServers() {
    const items = await getItems(SERVER_PREFIX)
    const servers = new Map<string, Server>();
    (items as Array<Server>).forEach((s) => {
      if (s.id)
        servers.set(s.id, s)
    })
    setServers(Object.fromEntries(servers))
  }
  
  function toggleServerModal(display:boolean, server?:string) {
    setShowServerModal(display)
    if (server)
      setCurrentServer(server)
  }

  function handlePivotClick(item?: PivotItem) {
    setCurrentServer((item && item.props.itemKey) ? item.props.itemKey : undefined)
  }

  async function connectToServer(serverID:string) {
    const server = servers[serverID]
    const currentConnections = {...connections}

    setIsConnecting(true)
    setConnectionError(undefined)

    // Check server data exists and we don't already have a connection to it
    if (server && !(currentConnections[serverID] && currentConnections[serverID].isConnected())) {
      try {
        const conn = new KdbConnection(server.host, server.port);
        currentConnections[serverID] = await conn.connect();
      } catch (e) {
        setConnectionError(e.toString())
      }
    }

    setConnections(currentConnections)
    if (currentConnections[serverID] && currentConnections[serverID].isConnected()) {
      setCurrentServer(serverID)
      setShowServerModal(false)
    }
    setIsConnecting(false)
  }

  function disconnectFromServer(sID:string) {
    const currentConnections = {...connections}
    if (currentConnections[sID]) {
      currentConnections[sID].reset()
      delete currentConnections[sID]
    }

    setConnections(currentConnections)
  }

  function saveServer(server: Server) {
    const current = {...servers}
    if (!server.id)
      server.id = uuid.v4()

    current[server.id] = server
    setServers(current)
    saveItem(SERVER_PREFIX, server)
  }

  function deleteServer(sID:string) {
    const current = {...servers}
    delete current[sID]
    setServers(current)
    deleteItem(SERVER_PREFIX, sID)
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

  return (
    <>
      <Modal
        titleAriaId="Manage Servers"
        isOpen={showServerModal}
        styles={{ "main": serverModal as IStyle }}
        onDismiss={() => toggleServerModal(false,)}
        isBlocking={Object.keys(connections).length === 0}
      > 
        <ManageServersContext.Provider value={{
          servers,
          connectToServer,
          saveServer,
          deleteServer,
          isConnecting,
          connectionError,
          setConnectionError
        }}>
          <ManageServers/>
        </ManageServersContext.Provider>
      </Modal>
      <Stack style={container}>
        <Stack horizontal={true} tokens={stackTokens} style={{flex:"0"}}>
          <CommandBar 
            items={items}/>
          <Pivot 
              selectedKey={currentServer || ""}
              style={{...pivots}}
              onLinkClick={handlePivotClick}>
              {Object.keys(connections).map((s) => (
                <PivotItem itemKey={s} key={s} headerText={servers[s].name}/>
              ))}
            </Pivot>
        </Stack>
        {Object.entries(connections).map(([k,v]:[string, KdbConnection])=> (
          <ServerInterface
            key={k}
            connection={v} 
            visible={k==currentServer}/>
        ))}
        
      </Stack>
    </>
  )
}

export default MainInterface