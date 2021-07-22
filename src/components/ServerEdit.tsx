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
import { addServer, connectServer, editServer, Server } from '../store/servers'
import { panel, stackTokens } from '../style'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { contextBridge } from 'electron'
import { ManageServerContext } from './ManageServers'

const ServerEdit:FC = () => {
  
  const context = useContext(ManageServerContext)
  console.log("Server", context.server)

  const server:Server = useSelector((state:RootState) => {
    if (context.server) {
      return state.servers.servers[context.server]
    } else {
      return {
        name: "",
        host: "",
        port: 0
      }
    }
  })
  const [name, setName] = useState("")
  const [host, setHost] = useState("")
  const [port, setPort] = useState(0)
  const dispatch = useDispatch()
  

  useEffect(() => {
    console.log("use effect", server)

    if (context.server) {
      setName(server!.name)
      setHost(server!.host)
      setPort(server!.port)
    } else {
      setName("")
      setHost("")
      setPort(0)
    }
    
  }, [context.server])

  function save() {

    if (!server!.id)
      server.id = uuid.v4()
    
    dispatch(
      editServer({
        id: server!.id,
        name,
        host,
        port
      })
    )
    
    context.setServer(server.id!)
  }

  function reset() {
    setName(server!.name)
    setHost(server!.host)
    setPort(server!.port)
  }

  function connect() {
    if (server && server.id) {
      dispatch(connectServer(server.id))
      context.closeModal()
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