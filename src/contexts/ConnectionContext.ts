import { createContext } from "react";
import KdbConnection from "../server/kdb-connection";
import Result from "../types/results";

type ConnectionContextType = {
  connection?: KdbConnection,
  results?: Result,
  isLoading: boolean,
  setIsLoading: (loading:boolean) => void,
  performQuery: (script:string) => void
}

export const ConnectionContext = createContext<ConnectionContextType>({
  isLoading: false,
  setIsLoading: () => {},
  performQuery: () => {}
})