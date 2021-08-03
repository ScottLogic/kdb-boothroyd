import {
  ITextProps,
  MessageBar,
  MessageBarType,
  Text,
} from "@fluentui/react";
import React, { FC } from "react";

interface ServeConnectionErrorProps {
  message: string;
  onDismiss: () => void;
}

const ServeConnectionError: FC<ServeConnectionErrorProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <MessageBar
      messageBarType={MessageBarType.error}
      isMultiline={true}
      onDismiss={onDismiss}
    >
      <Text block variant={"large" as ITextProps["variant"]}>
        Error connecting to server
      </Text>
      <br />
      <Text block>{message}</Text>
    </MessageBar>
  );
};

export default ServeConnectionError;