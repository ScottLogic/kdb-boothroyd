import React, { FC, useContext, useEffect, useState } from 'react'
import { 
  DefaultButton,
  ITextProps,
  MessageBar,
  MessageBarType,
  Overlay,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Stack, 
  Text, 
  TextField 
} from '@fluentui/react'
import uuid from "uuid"

import { stackTokens } from '../style'
import Server from '../types/server'
import { ManageServersContext } from '../contexts/ManageServersContext'
import { CurrentServerContext } from '../contexts/CurrentServerContext'

const ServerEdit:FC = () => {
  
  const {
    servers,
    saveServer,
    isConnecting,
    connectionError,
    connectToServer
  } = useContext(ManageServersContext)
  
  const {
    currentServer,
    setCurrentServer
  } = useContext(CurrentServerContext)

  const [server, setServer] = useState<Server>({
    name: "",
    host: "",
    port: 0
  })
  const [name, setName] = useState("")
  const [host, setHost] = useState("")
  const [port, setPort] = useState(0)
  const [canConnect, setCanConnect] = useState(false)

  useEffect(() => {
    let s
    if (currentServer) {
      s = servers[currentServer]
    } else {
      s = {
        name: "",
        host: "",
        port: 0
      }
    }
    setServer(s)
    setCanConnect(!!s.id)
  }, [currentServer])

  // If the server's been updated update our fields
  useEffect(() => {

    if (server) {
      setName(server!.name)
      setHost(server!.host)
      setPort(server!.port)
    } else {
      setName("")
      setHost("")
      setPort(0)
    }
    
  }, [server])

  useEffect(() => {
    if (
      name != server.name ||
      host != server.host ||
      port != server.port
    ) {
      setCanConnect(false)
    } else {
      if (server.id)
        setCanConnect(true)
    }
  }, [name, host, port])
  

  function save() {

    if (!server!.id)
      server.id = uuid.v4()

    const s = {
      id: server!.id,
      name,
      host,
      port
    }
    
    saveServer(s)

    setCurrentServer(server.id!)
    setServer(s)
    setCanConnect(true)
  }

  function reset() {
    setName(server!.name)
    setHost(server!.host)
    setPort(server!.port)
  }

  function connect() {
    if (server && server.id)
      connectToServer(server.id)
  }

  return (
    <Stack grow={true}>
      <Stack tokens={stackTokens}>
        <Text variant={ "large" as ITextProps["variant"]}>{(server.id) ? "Edit" : "Add"} Server</Text>
        <TextField
          label="Name"
          value={name}
          onChange={ (_, newValue) => {
            console.log('NEW', newValue)
            setName(newValue!) 
          }}
        />
        <TextField
          label="Host"
          value={host}
          onChange={ (_, newValue) => setHost(newValue!) }
        />
        <TextField
          label="Port"
          value={port.toString()}
          onChange={(_, newValue) => setPort(parseInt(newValue!)) }
        />
      </Stack>
      <Stack horizontal={true} tokens={stackTokens}>
        <DefaultButton text="Save" onClick={save}/>
        <DefaultButton text="Reset" onClick={reset}/>
      </Stack>
      <Stack horizontal={true} horizontalAlign="end" tokens={stackTokens}>
        <PrimaryButton  
          disabled={!canConnect || isConnecting}
          onClick={connect}>
          { isConnecting ? (
            <Spinner size={SpinnerSize.large}/>
          ) : (
            "Connect"
          )}
        </PrimaryButton>
      </Stack>
      {(connectionError) && (
        <Stack horizontal={true} horizontalAlign="center" tokens={stackTokens}>
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={true}
            >
            <Text block variant={"large" as ITextProps['variant']}>Error connecting to server</Text>
            <br/>
            <Text block>{connectionError}</Text>
          </MessageBar>
        </Stack>
      )}
    </Stack>
  )
}

export default ServerEdit