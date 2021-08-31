import {
  IComboBoxOptionStyles,
  ICommandBarStyles,
  IStackTokens,
} from "@fluentui/react";
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
  height: "100vh",
  maxHeight: "100vh",
  width: "100vw",
  maxWidth: "100vw",
  //backgroundColor: "#ccc",
  padding: "5px",
  boxSizing: "border-box",
};

export const panel: CSSProperties = {
  //margin: "5px",
  //backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
};

export const serverPanel: CSSProperties = {
  flex: "0",
  minWidth: "200px",
};

export const tablePanel: CSSProperties = {
  flex: "0",
};

export const tableListIcon: CSSProperties = {
  flex: "0",
  cursor: "pointer",
};

export const tableListName: CSSProperties = {
  flex: "1 1 auto",
};

export const tableListColumn: CSSProperties = {
  paddingLeft: "20px",
  height: "38px",
};

export const pivots: CSSProperties = {
  flex: "0 0 none",
};

export const pivotClose: CSSProperties = {
  marginLeft: "10px",
  width: 8,
  height: 8,
  fontSize: 8,
};

export const grabberBar: CSSProperties = {
  width: 10,
  height: 10,
  fontSize: 10,
  cursor: "row-resize",
};

export const editorWindow: CSSProperties = {
  flex: "1 1 auto",
  maxWidth: "100%",
  alignItems: "stretch",
  minHeight: 50,
};

export const editorWrapper: CSSProperties = {
  flex: "1 1 auto",
  overflow: "hidden",
};

export const resultsWindow: CSSProperties = {
  flex: "1 1 auto",
  position: "relative",
  minHeight: 50,
};

export const resultsWrapper: CSSProperties = {
  overflow: "auto",
  minHeight: 50,
  height: "100%",
};

export const agWrapper: CSSProperties = {
  flex: "1 1 auto",
};

export const serverModal: CSSProperties = {
  width: "75%",
  height: "75%",
};

export const stackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 10,
};
