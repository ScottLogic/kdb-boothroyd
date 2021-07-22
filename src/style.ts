import { IComboBoxOptionStyles, ICommandBarStyles, IStackTokens } from "@fluentui/react";
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
  gridTemplateColumns: "1fr 4fr",
  gridTemplateRows: "repeat(2, 1fr)",
  height: "100vh",
  //backgroundColor: "#ccc",
  padding: "5px",
  boxSizing: "border-box"
};

export const panel: CSSProperties = {
  margin: "5px",
  //backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start"
}

export const serverPanel: CSSProperties = {
  gridColumn: 1,
  gridRowStart:1,
  gridRowEnd:3,
  gridTemplateRows: "30px 30px 1fr",
}

export const editorWindow: CSSProperties = {
  gridRow: 1,
  gridColumnStart: 2,
  gridColumnEnd: 5
}

export const resultsWindow: CSSProperties = {
  gridRow: 2,
  gridColumnStart: 2,
  gridColumnEnd: 5
}

export const serverModal: CSSProperties = {
  width: "75%",
  height: "75%"
}

export const stackTokens:IStackTokens = {
  childrenGap: 10,
  padding: 10,
}