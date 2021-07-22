import { IStyle, Modal, Pivot, PivotItem, Stack } from '@fluentui/react'
import { connect } from 'node-q'
import React, { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import KdbConnection from '../server/kdb-connection'

import { RootState } from '../store'
import { container, pivots, serverModal, stackTokens } from '../style'
import EditorWindow from './EditorWindow'
import ManageServers from './ManageServers'
import ResultsWindow from './ResultsWindow'
import TablePanel from './TablePanel'

type MainContextType = {
  currentServer?: string,
  connections: {[key:string]:KdbConnection}
}

export const MainContext = React.createContext<MainContextType>({
  connections:{}
})

const MainInterface:FC = () => {

  const [showServerModal, setShowServerModal] = useState(true)
  const servers = useSelector((state:RootState) => state.servers.servers)
  const connectedServers = useSelector((state:RootState) => state.servers.connectedServers)
  const [currentServer, setCurrentServer] = useState<string | undefined>(undefined)
  const [connections, setConnections] = useState<{[key: string]:KdbConnection}>({})
  
  useEffect(() => {
    updateConnections()
  }, [connectedServers])

  async function updateConnections() {
    const conns = {...connections}

    for (let i = 0; i < connectedServers.length; i++) {
      const s:string = connectedServers[i]

      if (!conns[s] && servers[s]) {
        conns[s] = await KdbConnection.connect(
          servers[s].host,
          servers[s].port
        )
      }
    }

    setConnections(conns)
  }

  function toggleServerModal(display:boolean, server?:string) {
    setShowServerModal(display)
    if (server)
      setCurrentServer(server)
  }

  function handlePivotClick(item?: PivotItem) {
    setCurrentServer((item && item.props.itemKey) ? item.props.itemKey : undefined)
  }

  return (
    <>
      <Modal
        titleAriaId="Manage Servers"
        isOpen={showServerModal}
        styles={{ "main": serverModal as IStyle }}
        onDismiss={() => toggleServerModal(false,)}
        isBlocking={true}
      >
        <ManageServers closeModal={(server?:string) => toggleServerModal(false, server)}/>
      </Modal>
      <MainContext.Provider value={{currentServer, connections}}>
        <Stack horizontal={true} tokens={stackTokens} style={container}>
          <TablePanel toggleServerModal={toggleServerModal}/>
          <Stack style={{flex:"1 1 auto", alignItems:"stretch", minWidth: 0}}>
            <Pivot 
              selectedKey={currentServer || ""}
              style={{...pivots}}
              onLinkClick={handlePivotClick}>
              {connectedServers.map((s) => (
                <PivotItem itemKey={s} key={s} headerText={servers[s].name}/>
              ))}
            </Pivot>
            <EditorWindow/>
          </Stack>
        </Stack>
      </MainContext.Provider>
    </>
  )
}

export default MainInterface