import {
  CommandBar,
  ICommandBarItemProps,
  INavLink,
  Nav,
  PrimaryButton,
  Stack,
} from "@fluentui/react";
import React, { FC, useEffect, useState } from "react";
import Server, { SERVER_PREFIX } from "../../types/server";
import { getItems, saveItem, deleteItem } from "../../storage/storage";
import ServerEdit from "./ServerEdit";
import ServerDeleteConfirmation from "./ServerDeleteConfirmation";
import ServerConnectionError from "./ServerConnectionError";
import { stackTokens, serverPanel } from "../../style";
import { removeAtIndex, replaceAtIndex} from "../../utils";

type ServerManagerProps = {
  onConnect: (server: Server) => Promise<void>;
};

const ServerManager: FC<ServerManagerProps> = ({ onConnect }) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [hideDeleteConfirmation, setHideDeleteConfirmation] = useState(true);

  async function loadServers() {
    const items = (await getItems(SERVER_PREFIX)) as Server[];
    setServers(items);
  }

  useEffect(() => {
    loadServers();
  }, []);

  const groups = [
    {
      links: servers
        .sort((a, b) => {
          if (!a.id)
            return -1
          
          if (!b.id)
            return 1

          if (a.id == b.id)
            return 0
          else 
            return (a.id > b.id) ? -1 : 1
        })
        .map(
          (s) =>
            ({
              key: s.id,
              name: s.name,
            } as INavLink)
        ),
    },
  ];

  function serverSelected(e?: React.MouseEvent<HTMLElement>, item?: INavLink) {
    e && e.preventDefault();
    if (item && item.key) {
      setSelectedServerId(item.key);
    }
  }

  function saveServer(server: Server) {
    if (server.id) {
      const index = servers.findIndex((s) => s.id === server.id);
      setServers(replaceAtIndex(servers, server, index));
    } else {
      setServers([...servers, server]);
    }
    saveItem(SERVER_PREFIX, server);
  }

  const selectedServer =
    selectedServerId !== ""
      ? servers.find((s) => s.id === selectedServerId)
      : undefined;

  async function connectClick(server: Server) {
    try {
      await onConnect(server);
    } catch (e) {
      setConnectionError(e.message);
    }
  }

  function doDelete() {
    const index = servers.findIndex((s) => s.id === selectedServerId);
    setServers(removeAtIndex(servers, index));
    deleteItem(SERVER_PREFIX, selectedServerId);
    setSelectedServerId("");
    setHideDeleteConfirmation(true);
  }

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: "add",
      text: "Add",
      iconProps: { iconName: "Add" },
      onClick: () => {
        setSelectedServerId("");
      },
    },
    {
      key: "delete",
      text: "Delete",
      disabled: selectedServer == undefined,
      onClick: () => {
        setHideDeleteConfirmation(false);
      },
      iconProps: { iconName: "Delete" },
    },
  ];

  return (
    <Stack horizontal={true} tokens={stackTokens}>
      <Stack grow={false} style={{ ...serverPanel }}>
        <CommandBar items={commandBarItems} style={{ gridRow: 1 }} />
        <Nav
          selectedKey={selectedServerId}
          ariaLabel="Server List"
          groups={groups}
          onLinkClick={serverSelected}
        />
      </Stack>
      <Stack grow={true}>
        <ServerEdit
          server={selectedServer}
          onSave={saveServer}
          onConnect={connectClick}
        />
        {connectionError && (
          <ServerConnectionError
            message={connectionError}
            onDismiss={() => setConnectionError("")}
          />
        )}
      </Stack>
      <ServerDeleteConfirmation
        hidden={hideDeleteConfirmation}
        onDelete={doDelete}
        onCancel={() => setHideDeleteConfirmation(true)}
      />
    </Stack>
  );
};

export default ServerManager;
