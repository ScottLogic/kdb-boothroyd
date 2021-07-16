import React, { CSSProperties, FormEvent, RefObject } from 'react';
import ReactDom from 'react-dom';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
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
} from '@fluentui/react';
import storage from './storage/storage';
import KdbConnection from './server/kdb-connection';
import init from "./editor/editor";

initializeIcons();

interface Server {
  name: string;
  host: string;
  port: number;
  id: string;
}

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);


const customStyles: Partial<ICommandBarStyles> = {
  root: {
    height: '30px',
  },
};

const customStyles2: Partial<IComboBoxStyles> = {
  root: {
    height: '30px',
  },
};

interface MyAppState {
  servers: Map<string, Server>;
  initialising: boolean;
  selectedServer: string;
  result: string;
  editorVisible: boolean;
  editServer?: Server;
}

const containerGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '30px 1fr 1fr',
  gridAutoFlow: 'row',
  height: '100vh',
};

let connection: KdbConnection;

interface ServerEditState extends Server {
  
}

interface ServerEditProps {
  open: boolean;
  onClose: (ok: boolean, s?: Server) => void;
  server: Server;
}

class ServerEdit extends React.Component<ServerEditProps, ServerEditState> {

  constructor(props: ServerEditProps) {
    super(props);

    this.state = props.server || {
      name: '',
      host: '',
      port: 0,
    };
  }

  componentWillReceiveProps(props: ServerEditProps) {
      this.setState(Object.assign({}, props.server || {
        name: '',
        host: '',
        port: 0,
      }));
  }


  render() {
    const {name, host, port} = this.state;
    const {open, onClose} = this.props;

    return (<Dialog
        title="Connection Details"
        hidden={!open}
      >
        <Stack vertical >
          <TextField label="Name" value={name} onChange={(e) => this.setState({name: e.target.value})}/>
          <TextField label="Host" value={host} onChange={(e) => this.setState({host: e.target.value})} />
          <TextField label="Port" value={port} onChange={(e) => this.setState({port: e.target.value})} />
        </Stack>
        <DialogFooter>
          <PrimaryButton text="OK" onClick={() => onClose(true, this.state)}/>
          <DefaultButton text="Cancel" onClick={() => onClose(false, this.state)}/>
        </DialogFooter>
      </Dialog>);
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
      selectedServer: '',
      initialising: true,
      result: '',
      editorVisible: false,
      editServer: undefined
    };

    (async () => {
      storage.init();

      // fetch the persisted servers
      const servers = (await storage.getServers()) as Array<Server>;
      const serverMap = servers.reduce((map, s) => {
        map.set(s.id, s);
        return map;
      }, new Map<string, Server>());

      // select the first one
      const selectedServer = servers.length ? servers[0].id : '';

      if (selectedServer !== '') {
        const server = serverMap.get(selectedServer)!;
        try {
          connection = await KdbConnection.connect(server.host, server.port);
        } catch {}
      }

      // update state
      this.setState({
        servers: serverMap,
        selectedServer,
        initialising: false,
      });
    })();
  }

  componentDidMount() {
    init(this.myRef.current!);
  }

  selectedServerChanged(e: FormEvent<IComboBox>, option: IComboBoxOption | undefined) {
    this.setState({selectedServer: option!.key as string});
  };

  async editClose(ok: boolean, s?: Server) {
    if (ok) {
      await storage.saveServer(s);
      this.state.servers.set(s!.id, s!);
      this.setState({servers: this.state.servers, editorVisible: false});
    } else {
      this.setState({editorVisible: false});
    }
  }

  render() {
    const { editServer, editorVisible, servers, selectedServer, result } = this.state;

    const comboOptions: IComboBoxOption[] = [
      ...servers.values(),
    ].map((server) => ({ key: server.id, text: server.name }));

    const items: ICommandBarItemProps[] = [
      {
        key: 'edit',
        text: 'Edit',
        onClick: () => {
          this.setState({
            editorVisible: true,
            editServer: this.state.servers.get(this.state.selectedServer)!
          });
        }
      },
      {
        key: 'add',
        text: 'Add',
        onClick: () => {
          this.setState({
            editorVisible: true,
            editServer: undefined
          });
        }
      },
      {
        key: 'delete',
        text: 'Delete',
        onClick: () => {
          this.state.servers.delete(this.state.selectedServer);
          storage.deleteServer(this.state.selectedServer);
          this.setState({servers: this.state.servers, selectedServer: ""});
        }
      },
      {
        key: 'newItem2',
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
        key: 'newItem',
        text: 'Go',
        onClick: () => {
          (async () => {
            const res = await connection.send('til 10');
            this.setState({ result: res.data });
          })();
        },
        iconProps: { iconName: 'Play' },
      },
    ];

    return (
      <div style={containerGrid}>
        <ServerEdit open={editorVisible} onClose={this.editClose} server={editServer}/>
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
