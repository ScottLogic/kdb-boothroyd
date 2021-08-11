import { DefaultButton, Dialog, DialogFooter, DialogType, PrimaryButton } from "@fluentui/react";
import React, { FC } from "react";

interface ServerDeleteConfirmationProps {
  hidden: boolean;
  onDelete: () => void;
  onCancel: () => void;
}

const ServerDeleteConfirmation: FC<ServerDeleteConfirmationProps> = ({hidden, onDelete, onCancel}) => {
  return (
    <Dialog
      hidden={hidden}
      modalProps={{
        isBlocking:true,
        className: "server-delete-confirmation"
      }}
      onDismiss={onCancel}
      dialogContentProps={{
        type: DialogType.normal,
        title: "Delete Server",
        closeButtonAriaLabel: "Close",
        subText: "Are you sure you want to delete this server?",
      }}
    >
      <DialogFooter>
        <PrimaryButton onClick={onDelete} text="Delete" />
        <DefaultButton
          onClick={onCancel}
          text="Cancel"
        />
      </DialogFooter>
    </Dialog>
  );
};

export default ServerDeleteConfirmation;