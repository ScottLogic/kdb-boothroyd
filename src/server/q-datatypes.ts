export const QDataTypes: { [key: string]: string } = {
  "*": "list",
  b: "boolean",
  g: "guid",
  x: "byte",
  h: "short",
  i: "int",
  j: "long",
  e: "real",
  f: "float",
  c: "char",
  s: "symbol",
  p: "timestamp",
  m: "month",
  d: "date",
  z: "datetime",
  n: "timespan",
  u: "minute",
  v: "second",
  t: "time",
};

export type QColDict = { c: string };
export type QMetaDict = {
  t: string | null;
  f: string | null;
  a: string | null;
};
