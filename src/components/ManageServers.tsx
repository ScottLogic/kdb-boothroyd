import { Stack } from "@fluentui/react"
import React, { FC, useState } from "react"
import { CurrentServerContext } from "../contexts/CurrentServerContext"
import { stackTokens } from "../style"
import ServerEdit from "./ServerEdit"
import ServerPanel from "./ServerPanel"

const ManageServers:FC = () => {

  const [currentServer, setCurrentServer] = useState<string | undefined>(undefined)

  return (
    <CurrentServerContext.Provider value={{ currentServer, setCurrentServer }}>
      <Stack 
        horizontal={true}
        tokens={stackTokens}
        >
        <ServerPanel/>
        <ServerEdit/>
      </Stack>
    </CurrentServerContext.Provider>
  )
}

export default ManageServers