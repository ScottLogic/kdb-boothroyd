declare module "react-split" {
  import React from "react";
  import { Options } from "split.js";

  export interface SplitProps {
    sizes?: Options["sizes"];
    minSize?: Options["minSize"];
    maxSize?: Options["maxSize"];
    expandToMin?: Options["expandToMin"];
    gutterSize?: Options["gutterSize"];
    gutterAlign?: Options["gutterAlign"];
    snapOffset?: Options["snapOffset"];
    dragInterval?: Options["dragInterval"];
    direction?: Options["direction"];
    cursor?: Options["cursor"];
    gutter?: Options["gutter"];
    elementStyle?: Options["elementStyle"];
    gutterStyle?: Options["gutterStyle"];
    onDrag?: Options["onDrag"];
    onDragStart?: Options["onDragStart"];
    onDragEnd?: Options["onDragEnd"];
    collapsed?: Number;
  }

  export default class Split extends React.Component<
    React.HTMLAttributes<HTMLDivElement> & SplitProps,
    any
  > {}
}
