import { createContext } from "react"
import KdbConnection from "../server/kdb-connection"
import Result from "../types/results"
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
  results: {[key: string]: Result},
  updateResults: (server:string, script:string, results:any | null, error?:string) => void,
  isLoading: boolean,
  setIsLoading: (loading:boolean) => void,
  isConnecting: boolean,
  setIsConnecting: (connecting:boolean) => void,
  connectionError?: string,
  setConnectionError:(error?:string) => void
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
  setIsConnecting: () => {},
  setConnectionError: () => {}
})