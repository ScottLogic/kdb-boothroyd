import { Dialog, DialogFooter, DialogType, ITextProps, MessageBar, MessageBarType, PrimaryButton, Text } from '@fluentui/react'
import React, { FC } from 'react'

type ErrorDialogProps = {
  hidden: boolean,
  message: string,
  onDialogDismissed: () => void
}

const ErrorDialog:FC<ErrorDialogProps> = ({hidden = false, message="", onDialogDismissed}) => {
  return (
    <Dialog
      hidden={hidden}
      modalProps={{
        isBlocking:false
      }}
      onDismiss={onDialogDismissed}
      dialogContentProps={{
        type: DialogType.normal,
        title: "Error",
        closeButtonAriaLabel: "Close",
        subText: message,
      }}
      >
      <DialogFooter>
        <PrimaryButton onClick={onDialogDismissed} text="OK" />
      </DialogFooter>
    </Dialog>
  )
}

export default ErrorDialog