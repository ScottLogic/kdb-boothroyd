import { createContext } from "react"
import Server from "../types/server"

type ManageServersContext = {
  servers: {[key:string]: Server},
  connectToServer: (server:string) => void,
  saveServer: (server:Server) => void,
  deleteServer: (server:string) => void,
  isConnecting: boolean,
  connectionError?: string,
  setConnectionError: (error?: string) => void
}

export const ManageServersContext = createContext<ManageServersContext>({
  servers: {},
  connectToServer: () => {},
  saveServer: () => {},
  deleteServer: () => {},
  isConnecting: false,
  setConnectionError: () => {}
})