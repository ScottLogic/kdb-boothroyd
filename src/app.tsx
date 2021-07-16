import React, { CSSProperties, FormEvent, RefObject } from "react";
import ReactDom from "react-dom";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import {
  ComboBox,
  CommandBar,
  IComboBoxOption,
  ICommandBarItemProps,
  IComboBoxStyles,
  ICommandBarStyles,
  Modal,
  Dialog,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  Stack,
  TextField,
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
import init from "./editor/editor";

initializeIcons();

const mainElement = document.createElement("div");
document.body.appendChild(mainElement);

const customStyles: Partial<ICommandBarStyles> = {
  root: {
    height: "30px",
  },
};

const customStyles2: Partial<IComboBoxStyles> = {
  root: {
    height: "30px",
  },
};

interface MyAppState {
  servers: Map<string, Server>;
  selectedServer?: string;
  result: string;
  editorVisible: boolean;
  editServer?: Server;
}

const containerGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gridTemplateRows: "30px 1fr 1fr",
  gridAutoFlow: "row",
  height: "100vh",
};

let connection: KdbConnection;

interface ServerEditState extends Server {}

interface ServerEditProps {
  open: boolean;
  onClose: (ok: boolean, s?: Server) => void;
  server?: Server;
}

class ServerEdit extends React.Component<ServerEditProps, ServerEditState> {
  constructor(props: ServerEditProps) {
    super(props);

    this.state = props.server || {
      name: "",
      host: "",
      port: 0,
    };
  }

  componentWillReceiveProps(props: ServerEditProps) {
    this.setState(
      Object.assign(
        {},
        props.server || {
          name: "",
          host: "",
          port: 0,
        }
      )
    );
  }

  render() {
    const { name, host, port } = this.state;
    const { open, onClose } = this.props;

    return (
      <Dialog title="Connection Details" hidden={!open}>
        <Stack>
          <TextField
            label="Name"
            value={name}
            onChange={(_, newValue) => this.setState({ name: newValue! })}
          />
          <TextField
            label="Host"
            value={host}
            onChange={(_, newValue) => this.setState({ host: newValue! })}
          />
          <TextField
            label="Port"
            value={port.toString()}
            onChange={(_, newValue) =>
              this.setState({ port: parseInt(newValue!) })
            }
          />
        </Stack>
        <DialogFooter>
          <PrimaryButton text="OK" onClick={() => onClose(true, this.state)} />
          <DefaultButton
            text="Cancel"
            onClick={() => onClose(false, this.state)}
          />
        </DialogFooter>
      </Dialog>
    );
  }
}

class MyApp extends React.Component<unknown, MyAppState> {
  myRef: RefObject<HTMLDivElement>;

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
          connection = await KdbConnection.connect(server.host, server.port);
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
    init(this.myRef.current!);
  }

  selectedServerChanged(
    e: FormEvent<IComboBox>,
    option: IComboBoxOption | undefined
  ) {
    this.setState({ selectedServer: option!.key as string });
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
        key: "edit",
        text: "Edit",
        onClick: () => {
          if (!this.state.selectedServer) return;
          this.setState({
            editorVisible: true,
            editServer: this.state.servers.get(this.state.selectedServer)!,
          });
        },
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
      },
      {
        key: "newItem2",
        onRender: () => (
          <ComboBox
            options={comboOptions}
            selectedKey={selectedServer}
            styles={customStyles2}
            onChange={this.selectedServerChanged}
          />
        ),
      },
      {
        key: "newItem",
        text: "Go",
        onClick: () => {
          (async () => {
            const res = await connection.send("til 10");
            this.setState({ result: JSON.stringify(res.data) });
          })();
        },
        iconProps: { iconName: "Play" },
      },
    ];

    return (
      <div style={containerGrid}>
        <ServerEdit
          open={editorVisible}
          onClose={this.editClose}
          server={editServer}
        />
        <div style={{ gridRow: 1 }}>
          <CommandBar items={items} styles={customStyles} />
        </div>
        <div ref={this.myRef} style={{ gridRow: 2 }} />
        <pre style={{ gridRow: 3 }}>{result}</pre>
      </div>
    );
  }
}

ReactDom.render(<MyApp />, mainElement);
