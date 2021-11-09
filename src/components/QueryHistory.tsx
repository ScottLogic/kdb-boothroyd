import {
  DetailsList,
  IColumn,
  IconButton,
  Panel,
  SelectionMode,
  Stack,
} from "@fluentui/react";
import React, { FC, ReactNode } from "react";

interface QueryHistoryProps {
  history: string[];
  show: boolean;
  onDismiss: () => void;
}

const QueryHistory: FC<QueryHistoryProps> = ({
  history = [],
  show = false,
  onDismiss,
}: QueryHistoryProps) => {
  const items = history.map((q) => {
    return {
      query: q.substr(0, 100),
      actions: ["copy"],
    };
  });

  const columns = [
    {
      key: "query",
      name: "Query",
      fieldName: "query",
      minWidth: 100,
      maxWidth: 200,
      isResizable: false,
    },
    {
      key: "actions",
      name: "",
      fieldName: "actions",
      minWidth: 10,
      maxWidth: 100,
      isResizable: false,
    },
  ];

  const copyQuery = (query: string) => {
    navigator.clipboard.writeText(query);
    onDismiss();
  };

  const historyActions = {
    copy: (index: number) => (
      <IconButton
        iconProps={{ iconName: "copy" }}
        key="copy"
        onClick={() => copyQuery(history[index])}
      />
    ),
  };

  const renderHistoryEntry = (
    item?: any,
    index?: number,
    column?: IColumn
  ): ReactNode => {
    if (!column || !item) return <></>;

    return (
      <>
        {column.key === "query" ? (
          <>
            <Stack verticalAlign="center" style={{ height: "100%" }}>
              {item.query}
            </Stack>
          </>
        ) : (
          item.actions.map((a: keyof typeof historyActions) => {
            return historyActions[a](index || 0);
          })
        )}
      </>
    );
  };

  return (
    <Panel
      headerText="History"
      isOpen={show}
      onDismiss={onDismiss}
      className="history-panel"
      // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
      closeButtonAriaLabel="Close"
    >
      <DetailsList
        items={items}
        columns={columns}
        selectionMode={SelectionMode.none}
        onRenderItemColumn={renderHistoryEntry}
      />
    </Panel>
  );
};

export default QueryHistory;
