import {
  ActionButton,
  FontIcon,
  IIconProps,
  IPivotItemProps,
  IStyle,
  Modal,
  Pivot,
  PivotItem,
  Stack,
  useTheme,
} from "@fluentui/react";
import { ipcRenderer } from "electron";
import React, { FC, useState } from "react";
import { useEffect } from "react";
import KdbConnection from "../server/kdb-connection";
import path from "path";
import {
  container,
  pivotClose,
  pivots,
  serverModal,
  settingsModal,
} from "../style";
import Server from "../types/server";
import {
  applyCustomAuth,
  decryptWithAES,
  removeAtIndex,
  replaceAtIndex,
} from "../utils";
import ErrorDialog from "./ErrorDialog";
import ServerManager from "./server/ServerManager";
import ServerInterface from "./ServerInterface";
import uuid from "uuid";
import Settings from "../settings/settings";
import SettingsInterface from "./SettingsInterface";

interface ConnectionTab {
  connection: KdbConnection;
  filename?: string;
  name?: string;
  id: string;
  unsavedChanges: boolean;
}

function titleForTab(tab: ConnectionTab) {
  const name = tab.name || tab.connection.host;
  return tab.filename ? `${name} - ${path.basename(tab.filename)}` : name;
}

const MainInterface: FC = () => {
  const [showServerModal, setShowServerModal] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentConnection, setCurrentConnection] = useState<string | null>(
    null
  );
  const [connections, setConnections] = useState<ConnectionTab[]>([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const theme = useTheme();

  useEffect(() => {
    const connection = connections.find((c) => c.id === currentConnection);
    if (connection) {
      ipcRenderer.send(
        "update-title",
        `${titleForTab(connection)} ${connection.unsavedChanges ? "*" : ""}`
      );
    }
  }, [currentConnection, connections]);

  useEffect(() => {
    ipcRenderer
      .on("show-error", (_, error: string) => {
        setErrorMessage(error);
        setShowError(true);
      })
      .on("open-settings", () => {
        setShowSettingsModal(true);
      });

    return () => {
      ipcRenderer
        .removeAllListeners("show-error")
        .removeAllListeners("open-settings");
    };
  }, []);

  useEffect(() => {
    const index = connections.findIndex((c) => c.id === currentConnection);

    if (index == -1) {
      if (connections.length > 0) {
        setCurrentConnection(connections[0].id);
      } else {
        setCurrentConnection(null);
        setShowServerModal(true);
      }
    }
  }, [connections]);

  function handlePivotClick(item?: PivotItem) {
    if (item && item.props.itemKey) setCurrentConnection(item.props.itemKey);
  }

  async function connectToServer(server: Server) {
    const currentConnections = [...connections];
    const settings = Settings.getInstance();
    if (settings && settings.get("customAuthPlugin")) {
      settings.get("customAuthPlugin").forEach((p: string) => {
        server = applyCustomAuth(p, server);
      });
    }
    const connection = await new KdbConnection(server.host, server.port, {
      user: server.username,
      password: server.password ? decryptWithAES(server.password) : undefined,
      useTLS: server.useTLS || false,
    }).connect();

    const tab: ConnectionTab = {
      name: server.name,
      connection,
      id: uuid.v4(),
      unsavedChanges: false,
    };
    setConnections([...currentConnections, tab]);
    setCurrentConnection(tab.id);
    setShowServerModal(false);
  }

  function disconnectFromServer(name: string) {
    const index = connections.findIndex((c) => c.id === name);

    if (index == -1) return;

    connections[index].connection.reset();

    setConnections(removeAtIndex(connections, index));
  }

  function disconnectButtonClicked(key?: string) {
    if (key) disconnectFromServer(key);
  }

  function customPivotRenderer(
    tab: ConnectionTab,
    link?: IPivotItemProps,
    defaultRenderer?: (link?: IPivotItemProps) => JSX.Element | null
  ): JSX.Element | null {
    if (!link || !defaultRenderer) {
      return null;
    }

    return (
      <span
        style={{
          flex: "0 1 100%",
        }}
      >
        {defaultRenderer({ ...link, itemIcon: undefined })}
        <FontIcon
          iconName={tab.unsavedChanges ? "LocationFill" : "ChromeClose"}
          style={{ ...pivotClose }}
          onClick={() => disconnectButtonClicked(link.itemKey)}
        />
      </span>
    );
  }

  function onDialogDismissed() {
    setShowError(false);
  }

  const emojiIcon: IIconProps = { iconName: "Database" };

  return (
    <>
      <Modal
        containerClassName="server-management-modal"
        titleAriaId="Manage Servers"
        isOpen={showServerModal}
        styles={{ main: serverModal as IStyle }}
        isBlocking={connections.length == 0}
        onDismiss={() => setShowServerModal(false)}
      >
        <ServerManager onConnect={connectToServer} />
      </Modal>
      <Modal
        containerClassName="settings-modal"
        titleAriaId="Settings"
        isOpen={showSettingsModal}
        styles={{ main: settingsModal as IStyle }}
        isBlocking={false}
        onDismiss={() => setShowSettingsModal(false)}
      >
        <SettingsInterface onSave={() => setShowSettingsModal(false)} />
      </Modal>
      <ErrorDialog
        hidden={!showError}
        message={errorMessage}
        onDialogDismissed={onDialogDismissed}
      />
      <Stack
        style={{
          ...container,
          backgroundColor: theme.palette.neutralLighterAlt,
        }}
      >
        <Stack horizontal>
          <Stack.Item grow={3}>
            <Pivot
              selectedKey={currentConnection || ""}
              style={{
                ...pivots,
              }}
              className="connection-tabs"
              onLinkClick={handlePivotClick}
              overflowBehavior="menu"
            >
              {connections.map((c, i) => (
                <PivotItem
                  itemKey={c.id}
                  className={`connection-tab-${c.id}`}
                  key={i.toString()}
                  headerText={titleForTab(c)}
                  onRenderItemLink={(...args) =>
                    customPivotRenderer(c, ...args)
                  }
                />
              ))}
            </Pivot>
          </Stack.Item>
          <ActionButton
            className="show-servers-button"
            iconProps={emojiIcon}
            onClick={() => setShowServerModal(true)}
          >
            Servers
          </ActionButton>
        </Stack>
        {connections.map((c, i) => (
          <ServerInterface
            key={c.id}
            filename={c.filename}
            connection={c.connection}
            onFilenameChanged={(filename: string) => {
              c.filename = filename;
              setConnections(replaceAtIndex(connections, c, i));
            }}
            onUnsavedChangesChanged={(unsavedChanges: boolean) => {
              c.unsavedChanges = unsavedChanges;
              setConnections(replaceAtIndex(connections, c, i));
            }}
            visible={c.id === currentConnection}
          />
        ))}
      </Stack>
    </>
  );
};

export default MainInterface;
