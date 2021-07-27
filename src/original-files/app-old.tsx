import React, { FormEvent, RefObject } from "react";
import ReactDom from "react-dom";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import {
  ComboBox,
  CommandBar,
  IComboBoxOption,
  ICommandBarItemProps,
  IComboBox,
} from "@fluentui/react";
import {
  deleteServer,
  getServers,
  initStorage,
  saveServer,
  Server,
} from "./storage/storage";
import KdbConnection from "./server/kdb-connection";
import initEditor from "./editor/editor";
import ServerEdit from "./Components/server-edit";
import * as style from "./style";
import { editor } from "monaco-editor";

initializeIcons();

const mainElement = document.createElement("div");
document.body.appendChild(mainElement);

interface AppState {
  servers: Map<string, Server>;
  selectedServer?: string;
  result: string;
  editorVisible: boolean;
  editServer?: Server;
}

class MyApp extends React.Component<unknown, AppState> {
  myRef: RefObject<HTMLDivElement>;
  connection?: KdbConnection;
  editor?: editor.IStandaloneCodeEditor;

  constructor(props: unknown) {
    super(props);

    this.editClose = this.editClose.bind(this);
    this.selectedServerChanged = this.selectedServerChanged.bind(this);

    this.myRef = React.createRef();

    this.state = {
      servers: new Map<string, Server>(),
      selectedServer: "",
      result: "",
      editorVisible: false,
      editServer: undefined,
    };

    (async () => {
      initStorage();

      // fetch the persisted servers
      const servers = (await getServers()) as Array<Server>;
      const serverMap = servers.reduce((map, s) => {
        map.set(s.id!, s);
        return map;
      }, new Map<string, Server>());

      // select the first one
      const selectedServer = servers.length ? servers[0].id : undefined;

      if (selectedServer) {
        const server = serverMap.get(selectedServer)!;
        try {
          this.connection = await KdbConnection.connect(
            server.host,
            server.port
          );
        } catch {}
      }

      // update state
      this.setState({
        servers: serverMap,
        selectedServer,
      });
    })();
  }

  componentDidMount() {
    this.editor = initEditor(this.myRef.current!);
  }

  async selectedServerChanged(
    _: FormEvent<IComboBox>,
    option: IComboBoxOption | undefined
  ) {
    const selectedServer = option!.key as string;

    try {
      const server = this.state.servers.get(selectedServer)!;
      this.connection = await KdbConnection.connect(server.host, server.port);
    } catch {}

    this.setState({ selectedServer });
  }

  async editClose(ok: boolean, server?: Server) {
    if (ok && server) {
      await saveServer(server);
      this.state.servers.set(server.id!, server);
      this.setState({ servers: this.state.servers, editorVisible: false });
    } else {
      this.setState({ editorVisible: false });
    }
  }

  render() {
    const { editServer, editorVisible, servers, selectedServer, result } =
      this.state;

    const comboOptions: IComboBoxOption[] = Array.from(servers.values()).map(
      (server) => ({ key: server.id, text: server.name } as IComboBoxOption)
    );

    const items: ICommandBarItemProps[] = [
      {
        key: "server",
        text: "Server",
        iconProps: { iconName: "Database" },
        subMenuProps: {
          items: [
            {
              key: "edit",
              text: "Edit",
              onClick: () => {
                if (!this.state.selectedServer) return;
                this.setState({
                  editorVisible: true,
                  editServer: this.state.servers.get(
                    this.state.selectedServer
                  )!,
                });
              },
              iconProps: { iconName: "Edit" },
            },
            {
              key: "add",
              text: "Add",
              onClick: () => {
                this.setState({
                  editorVisible: true,
                  editServer: undefined,
                });
              },
              iconProps: { iconName: "Edit" },
            },
            {
              key: "delete",
              text: "Delete",
              onClick: () => {
                if (!this.state.selectedServer) return;
                this.state.servers.delete(this.state.selectedServer);
                deleteServer(this.state.selectedServer);
                this.setState({
                  servers: this.state.servers,
                  selectedServer: undefined,
                });
              },
              iconProps: { iconName: "Delete" },
            },
          ],
        },
      },

      {
        key: "combo",
        onRender: () => (
          <ComboBox
            options={comboOptions}
            selectedKey={selectedServer}
            styles={style.combo}
            onChange={this.selectedServerChanged}
          />
        ),
      },
      {
        key: "go",
        text: "Go",
        onClick: () => {
          (async () => {
            const input = this.editor!.getValue();
            const res = await this.connection!.send(input);
            this.setState({ result: JSON.stringify(res.data) });
          })();
        },
        iconProps: { iconName: "Play" },
      },
    ];

    return (
      <div style={style.container}>
        <ServerEdit
          open={editorVisible}
          onClose={this.editClose}
          server={editServer}
        />
        <div style={{ gridRow: 1 }}>
          <CommandBar items={items} styles={style.commandBar} />
        </div>
        <div ref={this.myRef} style={{ gridRow: 2 }} />
        <pre style={{ gridRow: 3 }}>{result}</pre>
      </div>
    );
  }
}

ReactDom.render(<MyApp />, mainElement);
