import React from "react";
import {
  Dialog,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  Stack,
  TextField,
} from "@fluentui/react";
import { Server } from "./storage/storage";

interface ServerEditState extends Server {}

interface ServerEditProps {
  open: boolean;
  onClose: (ok: boolean, s?: Server) => void;
  server?: Server;
}

export default class ServerEdit extends React.Component<
  ServerEditProps,
  ServerEditState
> {
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
