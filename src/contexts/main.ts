import { createContext } from "react"
import KdbConnection from "../server/kdb-connection"
import Server from "../types/server"

type MainContextType = {
  currentServer?: string,
  setCurrentServer: (server:string) => void,
  connections: {[key:string]:KdbConnection},
  connectToServer: (server:string) => void,
  disconnectFromServer: (server:string) => void,
  servers: {[key:string]: Server},
  saveServer: (server:Server) => void,
  deleteServer: (server:string) => void,
  results: {[key: string]: any},
  updateResults: (server:string, script:string | null, results:any) => void,
  isLoading: boolean,
  setIsLoading: (loading:boolean) => void,
  isConnecting: boolean,
  setIsConnecting: (connecting:boolean) => void
}

export const MainContext = createContext<MainContextType>({
  servers: {},
  connections:{},
  results: {},
  setCurrentServer: () => {},
  connectToServer: () => {},
  disconnectFromServer: () => {},
  saveServer: () => {},
  deleteServer: () => {},
  updateResults:() => {},
  isLoading: false,
  setIsLoading: () => {},
  isConnecting: false,
  setIsConnecting: () => {}
})