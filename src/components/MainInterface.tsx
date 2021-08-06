import { ActionButton, FontIcon, IIconProps, IPivotItemProps, IStyle, Modal, Pivot, PivotItem, Stack, useTheme } from '@fluentui/react'
import { ipcRenderer } from 'electron'
import React, { FC, useState } from 'react'
import { useEffect } from 'react'
import KdbConnection from '../server/kdb-connection'

import { container, pivotClose, pivots, serverModal } from '../style'
import Server from '../types/server'
import { removeAtIndex } from '../utils'
import ErrorDialog from './ErrorDialog'
import ServerManager from './server/ServerManager'
import ServerInterface from './ServerInterface'

interface NamedConnection {
  connection: KdbConnection;
  name: string;
};

const MainInterface:FC = () => {

  const [showServerModal, setShowServerModal] = useState(true)
  const [currentConnection, setCurrentConnection] = useState<string | null>(null);
  const [connections, setConnections] = useState<NamedConnection[]>([]);
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const theme = useTheme()

  ipcRenderer.on("show-error", (_, error:string) => {
    setErrorMessage(error)
    setShowError(true)
  })

  useEffect(() => {

    const index = connections.findIndex((c) => {
      return c.name === currentConnection
    })

    if (index == -1) {
      if (connections.length > 0) {
        console.log("SET INDEX TO 0")
        setCurrentConnection(connections[0].name)
      } else {
        console.log("SET INDEX TO -1")
        setCurrentConnection(null)
        setShowServerModal(true)
      }
    }
  }, [connections])

  function handlePivotClick(item?: PivotItem) {
    if (item && item.props.itemKey)
      setCurrentConnection(item.props.itemKey);
  }

  async function connectToServer(server: Server) {
    const currentConnections = [...connections];
    const connection = await new KdbConnection(server.host, server.port).connect()
    const named = {
      connection,
      // needs better naming logic here
      name: `${server.name} - (${connections.length + 1})`,
    }

    setConnections([...currentConnections, named]);
    setCurrentConnection(named.name);

    setShowServerModal(false);
  }

  function disconnectFromServer(name: string) {
    const index = connections.findIndex((c) => c.name === name)
    
    if (index == -1)
      return

    connections[index].connection.reset()

    setConnections(removeAtIndex(connections, index))
  }

  function disconnectButtonClicked(key?: string) {
    if (key)
      disconnectFromServer(key)
  }

  function customPivotRenderer(
    link?: IPivotItemProps,
    defaultRenderer?: (link?: IPivotItemProps) => JSX.Element | null,
  ): JSX.Element | null {
    if (!link || !defaultRenderer) {
      return null;
    }
  
    return (
      <span style={{ 
        flex: '0 1 100%',
        }}>
        {defaultRenderer({ ...link, itemIcon: undefined })}
        <FontIcon
          iconName="ChromeClose" 
          style={{...pivotClose}}
          onClick={() => disconnectButtonClicked(link.itemKey)}
          />
      </span>
    );
  }

  function onDialogDismissed() {
    setShowError(false)
  }

  const emojiIcon: IIconProps = { iconName: 'Database' };

  return (
    <>
      <Modal
        titleAriaId="Manage Servers"
        isOpen={showServerModal}
        styles={{ "main": serverModal as IStyle }}
        isBlocking={connections.length == 0}
        onDismiss={() => setShowServerModal(false)}
      > 
        <ServerManager onConnect={connectToServer}/>
      </Modal>
      <ErrorDialog hidden={!showError} message={errorMessage} onDialogDismissed={onDialogDismissed}/>
      <Stack style={{
          ...container,
          backgroundColor: theme.palette.neutralLighterAlt
        }}>
        <Stack horizontal>
          <Stack.Item grow={3}>
            <Pivot 
              selectedKey={currentConnection || ""}
              style={{
                ...pivots
              }}
              onLinkClick={handlePivotClick}
              overflowBehavior="menu">
              {connections.map((c, i) => (
                <PivotItem 
                  itemKey={c.name} 
                  key={i.toString()} 
                  headerText={c.name} 
                  onRenderItemLink={customPivotRenderer}
                  />
              ))}
            </Pivot>
          </Stack.Item>
          <ActionButton 
            iconProps={emojiIcon} 
            onClick={() => setShowServerModal(true)}>
              Servers
          </ActionButton>
        </Stack>
        {connections.map((c, i) => (
          <ServerInterface
            key={c.name}
            connection={c.connection} 
            visible={c.name === currentConnection}/>
        ))}
      </Stack>
    </>
  )
}

export default MainInterface