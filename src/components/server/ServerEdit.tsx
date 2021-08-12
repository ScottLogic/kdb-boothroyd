import {
  Checkbox,
  DefaultButton,
  ITextProps,
  Pivot,
  PivotItem,
  PrimaryButton,
  Stack,
  Text,
  TextField,
} from "@fluentui/react";
import React, { FC, useEffect, useState } from "react";

import Server from "../../types/server";
import { stackTokens } from "../../style";
import { decryptWithAES, encryptWithAES } from "../../utils";

interface ServerEditProps {
  server: Server | undefined;
  onSave: (server: Server) => void;
  onConnect: (server: Server) => void;
}

const ServerEdit: FC<ServerEditProps> = ({ server, onSave, onConnect }) => {
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState<number | undefined>(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tls, setTLS] = useState(false);

  const [changeMade, setChangeMade] = useState(false);

  useEffect(() => {
    setName(server ? server.name : "");
    setHost(server ? server.host : "");
    setPort(server ? server.port : 0);
    setUsername(server && server.username ? server.username : "");
    setPassword(
      server && server.password ? decryptWithAES(server.password) : ""
    );
    setTLS(server ? !!server.useTLS : false);
  }, [server]);

  useEffect(() => {
    if (server) {
      setChangeMade(
        name != server.name ||
          host != server.host ||
          port != server.port ||
          username != (server.username || "") ||
          password != decryptWithAES(server.password || "") ||
          tls != server.useTLS
      );
    } else {
      setChangeMade(name != "" && host != "");
    }
  }, [server, name, host, port, username, password, tls]);

  const stateToServer = () => {
    const p = port !== undefined ? port : 5001;
    let pwd;
    if (password != "") pwd = encryptWithAES(password);

    return {
      name,
      host,
      port: p,
      username: username != "" ? username : undefined,
      password: pwd,
      useTLS: tls,
      id: server ? server.id : undefined,
    } as Server;
  };

  const connectEnabled = name !== "" && host !== "" && port !== 0;

  return (
    <Stack grow={true} tokens={stackTokens}>
      <Stack tokens={stackTokens}>
        <Text variant={"large" as ITextProps["variant"]} className="header">
          {server ? "Edit" : "Add"} Server
        </Text>
        <Pivot className="edit-tabs">
          <PivotItem
            itemKey="server"
            headerText="Server"
            className="server-tab"
          >
            <Stack
              tokens={{
                childrenGap: "10 0",
              }}
            >
              <TextField
                label="Name"
                value={name}
                className="name-input"
                onChange={(_, newValue) => setName(newValue!)}
              />
              <TextField
                label="Host"
                value={host}
                className="host-input"
                onChange={(_, newValue) => setHost(newValue!)}
              />
              <TextField
                label="Port"
                value={port !== undefined ? port.toString() : ""}
                className="port-input"
                placeholder="5001"
                onChange={(_, newValue) =>
                  setPort(parseInt(newValue!) || undefined)
                }
              />
              <Checkbox
                label="Use tls?"
                className="tls-check"
                checked={tls}
                onChange={(_, checked?: boolean) => setTLS(checked || false)}
              />
            </Stack>
          </PivotItem>
          <PivotItem
            itemKey="auth"
            headerText="Authorisation"
            className="auth-tab"
          >
            <Stack
              tokens={{
                childrenGap: "10 0",
              }}
            >
              <TextField
                label="Username"
                value={username}
                className="username-input"
                onChange={(_, newValue) => setUsername(newValue!)}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                className="password-input"
                canRevealPassword
                revealPasswordAriaLabel="Show password"
                onChange={(_, newValue) => setPassword(newValue!)}
              />
            </Stack>
          </PivotItem>
        </Pivot>
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
