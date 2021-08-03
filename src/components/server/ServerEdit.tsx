import {
  DefaultButton,
  ITextProps,
  PrimaryButton,
  Stack,
  Text,
  TextField,
} from "@fluentui/react";
import React, { FC, useEffect, useState } from "react";
import Server from "../../types/server";
import { stackTokens } from "../../style";

interface ServerEditProps {
  server: Server | undefined;
  onSave: (server: Server) => void;
  onConnect: (server: Server) => void;
}

const ServerEdit: FC<ServerEditProps> = ({ server, onSave, onConnect }) => {
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState(0);
  const [port, setPort] = useState<number | undefined>(0);
  const [changeMade, setChangeMade] = useState(false)

  useEffect(() => {
    setName(server ? server.name : "");
    setHost(server ? server.host : "");
    setPort(server ? server.port : 0);
  }, [server]);

  useEffect(() => {
    if (server) {
      setChangeMade(
        name != server.name ||
        host != server.host ||
        port != server.port
      )
    } else {
      setChangeMade(
        name != "" &&
        host != ""
      )
    }
  }, [server, name, host, port])

  const stateToServer = () => {

    const p = (port !== undefined) ? port : 5001
    return ({
      name,
      host,
      port: p,
      id: server ? server.id : undefined,
    } as Server)
  }

  const connectEnabled = name !== "" && host !== "" && port !== 0;

  return (
    <Stack grow={true} tokens={stackTokens}>
      <Stack tokens={stackTokens}>
        <Text variant={"large" as ITextProps["variant"]}>
          {server ? "Edit" : "Add"} Server
        </Text>
        <TextField
          label="Name"
          value={name}
          onChange={(_, newValue) => setName(newValue!)}
        />
        <TextField
          label="Host"
          value={host}
          onChange={(_, newValue) => setHost(newValue!)}
        />
        <TextField
          label="Port"
          value={(port !== undefined) ? port.toString() : ""}
          placeholder="5001"
          onChange={(_, newValue) => setPort(parseInt(newValue!) || undefined)}
        />
      </Stack>
      <Stack horizontal={true} tokens={stackTokens}>
        <DefaultButton
          text="Save"
          disabled={!changeMade}
          onClick={() => onSave(stateToServer())}
        />
        <PrimaryButton
          disabled={!connectEnabled}
          onClick={() => onConnect(stateToServer())}
        >
          Connect
        </PrimaryButton>
      </Stack>
    </Stack>
  );
};

export default ServerEdit;
