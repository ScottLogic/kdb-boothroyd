import { configureStore } from "@reduxjs/toolkit";
import { initStorage } from "../storage/storage";
import { serversReducer } from "./servers";

initStorage()

const store = configureStore({
  reducer: {
    servers: serversReducer
  }
})

export type RootState = ReturnType<typeof store.getState>

export default store