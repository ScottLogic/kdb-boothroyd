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
import { ManageServerContext } from './ManageServers'
import Server from '../types/server'
import { MainContext } from '../contexts/MainContext'

const ServerEdit:FC = () => {
  
  const context = useContext(ManageServerContext)
  const mainContext = useContext(MainContext)
  const isConnecting = mainContext.isConnecting
  const connectionError = mainContext.connectionError

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
    let server
    if (context.server) {
      server = mainContext.servers[context.server]
    } else {
      server = {
        name: "",
        host: "",
        port: 0
      }
    }
    setServer(server)
    setCanConnect(!!server.id)
  }, [context.server])

  // If the server's been updated update our fields
  useEffect(() => {

    if (context.server) {
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
    
    mainContext.saveServer(s)

    context.setServer(server.id!)
    setServer(s)
    setCanConnect(true)
  }

  function reset() {
    setName(server!.name)
    setHost(server!.host)
    setPort(server!.port)
  }

  function connect() {
    if (server && server.id) {
      mainContext.connectToServer(server.id)
      mainContext.setIsConnecting(true)
    }
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