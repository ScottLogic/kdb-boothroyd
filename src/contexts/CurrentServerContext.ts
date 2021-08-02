import { createContext } from "react"

type CurrentServerContextType = {
  currentServer?: string,
  setCurrentServer: (s?: string) => void 
}

export const CurrentServerContext = createContext<CurrentServerContextType>({
  setCurrentServer: () => {}
})