import { Stack } from "@fluentui/react"
import React, { FC, useState } from "react"
import { Server } from "../store/servers"
import { stackTokens } from "../style"
import ServerEdit from "./ServerEdit"
import ServerPanel from "./ServerPanel"

type ManageServerContextProps = {
  server: string | undefined,
  setServer: (server?:string) => void,
  closeModal: (server?:string) => void
}

export const ManageServerContext = React.createContext<ManageServerContextProps>({
  server:"",
  setServer:() => {},
  closeModal: () => {}
})

type ManageServersProps = {
  closeModal: () => void
}

const ManageServers:FC<ManageServersProps> = ({closeModal}:ManageServersProps) => {

  const [server, setServer] = useState<string | undefined>(undefined)

  return (
    <ManageServerContext.Provider value={{server, setServer, closeModal}}>
      <Stack 
        horizontal={true}
        tokens={stackTokens}
        >
        <ServerPanel/>
        <ServerEdit/>
      </Stack>
    </ManageServerContext.Provider>
  )
}

export default ManageServers