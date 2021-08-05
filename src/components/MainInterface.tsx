import { ActionButton, FontIcon, IIconProps, IPivotItemProps, IStyle, Modal, Pivot, PivotItem, Stack, useTheme } from '@fluentui/react'
import { ipcRenderer } from 'electron'
import React, { FC, useState } from 'react'
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
  const [currentConnectionIndex, setCurrentConnectionIndex] = useState(-1);
  const [connections, setConnections] = useState<NamedConnection[]>([]);
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const theme = useTheme()

  ipcRenderer.on("show-error", (_, error:string) => {
    setErrorMessage(error)
    setShowError(true)
  })

  function handlePivotClick(item?: PivotItem) {
    if (item && item.props.itemKey)
      setCurrentConnectionIndex(parseInt(item.props.itemKey));
  }

  async function connectToServer(server: Server) {
    const currentConnections = [...connections];
    const connection = await new KdbConnection(
      server.host, 
      server.port,
      server.username,
      server.password
    ).connect()
    
    setConnections([...currentConnections, {
      connection,
      // needs better naming logic here
      name: `${server.name} - (${connections.length + 1})`,
    }]);
    setCurrentConnectionIndex(connections.length);

    setShowServerModal(false);
  }

  function disconnectFromServer(index: number) {
    const toRemove = connections[index]
    toRemove.connection.reset()
    setConnections(removeAtIndex(connections, index))
    if (currentConnectionIndex == index && connections.length > 1) {
      setCurrentConnectionIndex(0)
    }

    if (connections.length == 1) {
      setCurrentConnectionIndex(-1)
      setShowServerModal(true)
    }
  }

  function disconnectButtonClicked(key?: string) {
    if (key) {
      disconnectFromServer(parseInt(key))
    }
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
              selectedKey={currentConnectionIndex !== -1 ? currentConnectionIndex.toString() : ""}
              style={{
                ...pivots
              }}
              onLinkClick={handlePivotClick}
              overflowBehavior="menu">
              {connections.map((c, i) => (
                <PivotItem 
                  itemKey={i.toString()} 
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
            visible={i === currentConnectionIndex}/>
        ))}
      </Stack>
    </>
  )
}

export default MainInterface