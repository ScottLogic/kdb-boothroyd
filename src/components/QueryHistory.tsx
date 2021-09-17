import { DetailsList, Panel, SelectionMode } from "@fluentui/react";
import React, { FC } from "react";

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
  ];

  return (
    <Panel
      headerText="History"
      isOpen={show}
      onDismiss={onDismiss}
      // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
      closeButtonAriaLabel="Close"
    >
      <DetailsList
        items={items}
        columns={columns}
        selectionMode={SelectionMode.none}
      />
    </Panel>
  );
};

export default QueryHistory;
