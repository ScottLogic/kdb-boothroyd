import React, { FC, useContext, useEffect, useState } from 'react'
import { 
  DefaultButton,
  ITextProps,
  PrimaryButton,
  Stack, 
  Text, 
  TextField 
} from '@fluentui/react'
import uuid from "uuid"
import { stackTokens } from '../style'
import { ManageServerContext } from './ManageServers'
import Server from '../types/server'
import { MainContext } from '../contexts/main'

const ServerEdit:FC = () => {
  
  const context = useContext(ManageServerContext)
  const mainContext = useContext(MainContext)

  const [server, setServer] = useState<Server>({
    name: "",
    host: "",
    port: 0
  })
  const [name, setName] = useState("")
  const [host, setHost] = useState("")
  const [port, setPort] = useState(0)

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
  }, [context.server])

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

  function save() {

    if (!server!.id)
      server.id = uuid.v4()
    
    mainContext.saveServer({
      id: server!.id,
      name,
      host,
      port
    })    
    context.setServer(server.id!)
  }

  function reset() {
    setName(server!.name)
    setHost(server!.host)
    setPort(server!.port)
  }

  function connect() {
    if (server && server.id) {
      mainContext.connectToServer(server.id)
      context.closeModal(server.id)
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
          text="Connect" 
          disabled={!server.id}
          onClick={connect}/>
      </Stack>
    </Stack>
  )
}

export default ServerEdit