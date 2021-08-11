import {
  Dialog,
  DialogFooter,
  DialogType,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";
import React, { FC } from "react";

export enum UnsavedChangesAction {
  Save,
  DontSave,
  Cancel,
}

type UnsavedChangesDialogProps = {
  hidden: boolean;
  filename: string;
  onDialogDismissed: (action: UnsavedChangesAction) => void;
};

const UnsavedChangesDialog: FC<UnsavedChangesDialogProps> = ({
  hidden,
  filename,
  onDialogDismissed,
}) => {
  return (
    <Dialog
      hidden={hidden}
      modalProps={{
        isBlocking: false,
      }}
      onDismiss={() => onDialogDismissed(UnsavedChangesAction.Cancel)}
      dialogContentProps={{
        type: DialogType.normal,
        title: "Error",
        closeButtonAriaLabel: "Close",
        subText: `unsaved changes to ${filename}`,
      }}
    >
      <DialogFooter>
        <PrimaryButton
          onClick={() => onDialogDismissed(UnsavedChangesAction.Save)}
          text="Save"
        />
        <DefaultButton
          onClick={() => onDialogDismissed(UnsavedChangesAction.DontSave)}
          text="Don't Save"
        />
        <DefaultButton
          onClick={() => onDialogDismissed(UnsavedChangesAction.Cancel)}
          text="Cancel"
        />
      </DialogFooter>
    </Dialog>
  );
};

export default UnsavedChangesDialog;