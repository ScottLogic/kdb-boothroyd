import uuid from "uuid";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

import { ADD_SERVER, CONNECT_SERVER, DELETE_SERVER, DISCONNECT_SERVER, EDIT_SERVER, LOAD_SERVERS } from "./action-types"
import { deleteItem, getItems, saveItem } from "../storage/storage";

export interface Server {
  name: string;
  host: string;
  port: number;
  id?: string;
  tables?: string[];
}

const PREFIX = "server-"

// INITIAL STATE
type ServerState = {
  servers: {[key: string]: Server},
  connectedServers: string[]
}

const initialState:ServerState = {
  servers: {},
  connectedServers:[]
}

// REDUCERS
const reducers = {
  addServer: (state:any, action:PayloadAction<Server>) => {
    if (!action.payload.id) {
      action.payload.id = uuid.v4();
    }
    state.servers[action.payload.id] = action.payload
    saveItem(PREFIX, state.servers[action.payload.id])
  },
  editServer: (state:any, action:PayloadAction<Server>) => {
    state.servers[action.payload.id!] = action.payload
    saveItem(PREFIX, state.servers[action.payload.id!])
  },
  deleteServer: (state:any, action:PayloadAction<string>) => {
    delete state.servers[action.payload]
    deleteItem(PREFIX, action.payload)
  },
  connectServer: (state:any, action:PayloadAction<string>) => {
    if (!state.connectedServers.includes(action.payload))
      state.connectedServers.push(action.payload)
  },
  disconnectServer: (state:any, action:PayloadAction<string>) => {
    if (state.connectedServers.includes(action.payload)) {
      const i = state.connectedServers.indexOf(action.payload)
      state.connectedServers.splice(i,1)
    }
  }
}

// ASYNC ACTIONS
export const loadServers = createAsyncThunk<{}>("servers/loadServers", async () => {
  const items = await getItems(PREFIX)
  const servers = new Map<string, Server>();
  (items as Array<Server>).forEach((s) => {
    if (s.id)
      servers.set(s.id, s)
  })
  console.log("servers", servers)
  return Object.fromEntries(servers)
})

// SLICE
export const serversSlice = createSlice({
  name: "servers",
  initialState,
  reducers,
  extraReducers: (builder) => {
    builder
      .addCase(loadServers.pending, () => {

      })
      .addCase(loadServers.fulfilled, (state, { payload }) => {
        console.log("payload", payload)
        state.servers = payload
      })
      .addCase(loadServers.rejected, () => {

      })
  }
})

export const {
  addServer,
  editServer,
  deleteServer,
  connectServer,
  disconnectServer
} = serversSlice.actions
export const serversReducer = serversSlice.reducer

