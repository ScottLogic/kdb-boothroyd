import { Stack } from '@fluentui/react'
import React, { FC, useState } from 'react'
import { ConnectionContext } from '../contexts/ConnectionContext'
import KdbConnection from '../server/kdb-connection'
import { stackTokens } from '../style'
import Result from '../types/results'
import EditorWindow from './EditorWindow'
import ResultsWindow from './ResultsWindow'
import TablePanel from './TablePanel'

type ServerInterfaceProps = {
  connection: KdbConnection,
  visible: boolean
}

const ServerInterface:FC<ServerInterfaceProps> = ({connection, visible=false}:ServerInterfaceProps) => {

  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Result | undefined>()

  async function performQuery(script:string) {
    if (connection && connection.isConnected()) {
      try {
        setIsLoading(true)
        const res = await connection.send(script)
        setResults({
          script, 
          data:res.data
        })
      } catch (e) {
        setResults({
          script, 
          data: null, 
          error: e
        })
      }
    }
  }

  return (
    <ConnectionContext.Provider value={{
      connection,
      results,
      performQuery,
      isLoading,
      setIsLoading
    }}>
      <Stack 
        horizontal={true} 
        tokens={stackTokens} 
        style={{
          maxHeight:"100%",
          flex:"1 1 auto", 
          alignItems:"stretch",
          display: (visible) ? "flex" : "none"
        }}>
        <TablePanel/>
        <Stack style={{flex:"1 1 auto", alignItems:"stretch", minWidth: 0}}>
          <EditorWindow/>
          <ResultsWindow/>
        </Stack>
      </Stack>
    </ConnectionContext.Provider>
  )

}

export default ServerInterface