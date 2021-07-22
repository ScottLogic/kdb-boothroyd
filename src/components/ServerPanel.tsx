import { 
  CommandBar, 
  ICommandBarItemProps,
  Nav, 
  INavLink, 
  INavLinkGroup,
  Stack,
  Dialog,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  DialogType
} from "@fluentui/react"
import React, { FunctionComponent, useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { panel, serverPanel } from "../style"
import { RootState } from "../store"
import { deleteServer, loadServers, Server } from "../store/servers"
import { ManageServerContext } from "./ManageServers"
import { set } from "electron-json-storage"

const ServerPanel:FunctionComponent = () => {

  const context = useContext(ManageServerContext)
  const dispatch = useDispatch()
    
  const servers:{[key: string]: Server} = useSelector((state:RootState) => state.servers.servers)
  const [hideDeleteConfirmation, setHideDeleteConfirmation] = useState(true)
  const [navLinkGroups, setNavLinkGroups] = useState<INavLinkGroup[]>([])

  useEffect(() => {

    // Put servers into added order with earliest first
    const sorted = (Object.values(servers) as [Server])
      .sort((a,b) => {
        if (a.id == b.id)
          return 0
        else
          return (a.id! < b.id!) ? 1 : -1
      })

    const links = Array.from(sorted, (s) => {
      return {
        key: s.id,
        name: s.name,
        url: s.id,
        expandAriaLabel: 'Show Tables',
        collapseAriaLabel: 'Hide Tables'
      } as INavLink
    })

    setNavLinkGroups([
      {
        links
      }
    ])

  }, [servers])

  useEffect(() => {
    dispatch(loadServers())
  }, [])

  const items: ICommandBarItemProps[] = [
    {
      key: "add",
      text: "Add",
      iconProps: { iconName: "Add" },
      onClick: () => {
        context.setServer(undefined)
      },
    },
    {
      key: "delete",
      text: "Delete",
      disabled: !context.server,
      onClick: () => {
        if (!context.server)
          return;

        setHideDeleteConfirmation(false)
      },
      iconProps: { iconName: "Delete" },
    }
  ]

  // Select a server and update the context
  function serverSelected(e?: React.MouseEvent<HTMLElement>, item?: INavLink) {
    e && e.preventDefault()
    if (item)
      context.setServer(item.key)
  }

  // Perform actual delete operation after confiration
  function doDelete() {
    dispatch(deleteServer(context.server!))
    context.setServer(undefined)
    setHideDeleteConfirmation(true)
  }

  return (
    <Stack grow={false} style={{...serverPanel}}>
      <CommandBar 
        items={items}
        style={{ gridRow: 1 }}/>
      <Nav
        onLinkClick={serverSelected}
        selectedKey={context.server || ""}
        ariaLabel="Server List"
        groups={navLinkGroups}
      />
      <Dialog
        hidden={hideDeleteConfirmation}
        onDismiss={() => setHideDeleteConfirmation(true)}
        dialogContentProps = {{
          type: DialogType.normal,
          title: 'Delete Server',
          closeButtonAriaLabel: 'Close',
          subText: 'Are you sure you want to delete this server?',
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={doDelete} text="Delete" />
          <DefaultButton onClick={() => setHideDeleteConfirmation(true)} text="Cancel" />
        </DialogFooter>
      </Dialog>
    </Stack>
  )
}

export default ServerPanel