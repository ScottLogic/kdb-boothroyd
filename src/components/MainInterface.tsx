import { ActionButton, CommandBar, ICommandBarItemProps, IconButton, IIconProps, IStyle, Modal, Pivot, PivotItem, Stack } from '@fluentui/react'
import React, { FC, useState } from 'react'
import KdbConnection from '../server/kdb-connection'

import { container, pivots, serverModal, stackTokens } from '../style'
import Server from '../types/server'
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


  function handlePivotClick(item?: PivotItem) {
    if (item && item.props.itemKey) {
      setCurrentConnectionIndex(parseInt(item.props.itemKey));
    }
  }

  async function connectToServer(server: Server) {
    const currentConnections = [...connections];
    console.log("CONNECT TO:", server)
    const connection = await new KdbConnection(server.host, server.port).connect()
    setConnections([...currentConnections, {
      connection,
      // needs better naming logic here
      name: `${server.name} - (${connections.length})`,
    }]);
    setCurrentConnectionIndex(connections.length);
    setShowServerModal(false);
  }

  const emojiIcon: IIconProps = { iconName: 'Database' };

  return (
    <>
      <Modal
        titleAriaId="Manage Servers"
        isOpen={showServerModal}
        styles={{ "main": serverModal as IStyle }}
        onDismiss={() => setShowServerModal(false)}
      > 
        <ServerManager onConnect={connectToServer}/>
      </Modal>
      <Stack style={container}>
        <Stack horizontal>
          <Stack.Item grow={3} >
          <Pivot 
            selectedKey={currentConnectionIndex !== -1 ? connections[currentConnectionIndex].name : undefined}
            style={{...pivots}}
            onLinkClick={handlePivotClick}>
            {connections.map((c, i) => (
              <PivotItem itemKey={i.toString()} key={i.toString()} headerText={c.name}/>
            ))}
          </Pivot>
          </Stack.Item>
          <ActionButton iconProps={emojiIcon} onClick={() => setShowServerModal(true)}>Servers</ActionButton>
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