import { 
  CommandBar, 
  ICommandBarItemProps,
  IComboBoxOption,
  Nav, 
  INavLink, 
  INavStyles, 
  INavLinkGroup
} from "@fluentui/react"
import React, { FunctionComponent, useState } from "react"
import ServerEdit from "./server-edit"

import { panel, serverPanel } from "../style"

const ServerPanel:FunctionComponent = () => {

  const [editorVisible, setEditorVisible] = useState(false)
  const [server, setServer] = useState<String | undefined>(undefined)
  
  const servers = [
    "Server 1",
    "Server 2",
    "Server 3"
  ]

  const navLinkGroups: INavLinkGroup[] = [
    {
      links: servers.map((s) => {
        return {
          name: s,
          url: s,
          expandAriaLabel: 'Show Tables',
          collapseAriaLabel: 'Hide Tables',
          isExpanded: server === s
        }
      })
    }
  ]

  const items: ICommandBarItemProps[] = [
    {
      key: "add",
      text: "Add",
      iconProps: { iconName: "Add" },
      onClick: () => {
        setEditorVisible(true)
        setServer(undefined)
      },
    },
    {
      key: "edit",
      text: "Edit",
      disabled: !server,
      onClick: () => {
        if (!server)
          return;

        setEditorVisible(true)
      },
      iconProps: { iconName: "Edit" },
    },
    {
      key: "delete",
      text: "Delete",
      disabled: !server,
      onClick: () => {
        if (!server)
          return;

        //servers.delete(this.state.selectedServer);
        
        /*deleteServer(this.state.selectedServer);
        this.setState({
          servers: this.state.servers,
          selectedServer: undefined,
        });*/
      },
      iconProps: { iconName: "Delete" },
    }
  ]

  function editClose() {

  }

  function serverSelected(e?: React.MouseEvent<HTMLElement>, item?: INavLink) {
    e && e.preventDefault()
    console.log('ITEM', item)
    if (item)
      setServer(item.url)
  }



  return (
    <>
      <ServerEdit
          open={editorVisible}
          onClose={editClose}
          server={server}
        />
      <div style={{
        ...panel,
        ...serverPanel 
      }}>
        <CommandBar 
          items={items}
          style={{ gridRow: 1 }}/>
        <Nav
          onLinkClick={serverSelected}
          selectedKey="server1"
          ariaLabel="Server List"
          groups={navLinkGroups}
        />
      </div>
    </>
  )
}

export default ServerPanel