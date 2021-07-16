import { IComboBoxOptionStyles, ICommandBarStyles } from "@fluentui/react";
import { CSSProperties } from "react";

export const commandBar: Partial<ICommandBarStyles> = {
  root: {
    height: "30px",
  },
};

export const combo: Partial<IComboBoxOptionStyles> = {
  root: {
    height: "30px",
  },
};

export const container: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gridTemplateRows: "30px 1fr 1fr",
  gridAutoFlow: "row",
  height: "100vh",
};
