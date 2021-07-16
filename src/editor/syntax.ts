const syntax = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  defaultToken: "",

  keywords: [
    "abs",
    "acos",
    "aj",
    "aj0",
    "ajf",
    "ajf0",
    "all",
    "and",
    "any",
    "asc",
    "asin",
    "asof",
    "atan",
    "attr",
    "avg",
    "avgs",
    "bin",
    "binr",
    "ceiling",
    "cols",
    "cor",
    "cos",
    "count",
    "cov",
    "cross",
    "csv",
    "cut",
    "delete",
    "deltas",
    "desc",
    "dev",
    "differ",
    "distinct",
    "div",
    "do",
    "dsave",
    "each",
    "ej",
    "ema",
    "enlist",
    "eval",
    "except",
    "exec",
    "exit",
    "exp",
    "fby",
    "fills",
    "first",
    "fkeys",
    "flip",
    "floor",
    "get",
    "getenv",
    "group",
    "gtime",
    "hclose",
    "hcount",
    "hdel",
    "hopen",
    "hsym",
    "iasc",
    "idesc",
    "if",
    "ij",
    "ijf",
    "in",
    "insert",
    "inter",
    "inv",
    "key",
    "keys",
    "last",
    "like",
    "lj",
    "ljf",
    "load",
    "log",
    "lower",
    "lsq",
    "ltime",
    "ltrim",
    "mavg",
    "max",
    "maxs",
    "mcount",
    "md5",
    "mdev",
    "med",
    "meta",
    "min",
    "mins",
    "mmax",
    "mmin",
    "mmu",
    "mod",
    "msum",
    "neg",
    "next",
    "not",
    "null",
    "or",
    "over",
    "parse",
    "peach",
    "pj",
    "prd",
    "prds",
    "prev",
    "prior",
    "rand",
    "rank",
    "ratios",
    "raze",
    "read0",
    "read1",
    "reciprocal",
    "reval",
    "reverse",
    "rload",
    "rotate",
    "rsave",
    "rtrim",
    "save",
    "scan",
    "scov",
    "sdev",
    "select",
    "set",
    "setenv",
    "show",
    "signum",
    "sin",
    "sqrt",
    "ss",
    "ssr",
    "string",
    "sublist",
    "sum",
    "sums",
    "sv",
    "svar",
    "system",
    "tables",
    "tan",
    "til",
    "trim",
    "type",
    "uj",
    "ujf",
    "ungroup",
    "union",
    "update",
    "upper",
    "upsert",
    "value",
    "var",
    "view",
    "views",
    "vs",
    "wavg",
    "where",
    "while",
    "within",
    "wj",
    "wj1",
    "wsum",
    "xasc",
    "xbar",
    "xcol",
    "xcols",
    "xdesc",
    "xexp",
    "xgroup",
    "xkey",
    "xlog",
    "xprev",
    "xrank",
  ],

  operators: [
    // operators
    "@",
    ".",
    "$",
    "!",
    "?",
    "+",
    "-",
    "*",
    "%",
    "=",
    "<>",
    "<",
    "<=",
    ">",
    ">=",
    "~",
    "|",
    "&",
    "#",
    "_",
    "^",
    ",",
    "'",
    // iterators
    "'",
    "/:",
    "/",
    "':",
    "\\:",
    "\\",
    "':",
  ],

  symbols: /[_=><!~?:&|+\-*\/\^%@,;\\]+/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [
        /[a-zA-Z]\w*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "variable",
          },
        },
      ],

      // symbols
      [/`\w*/, "symbol"],

      // whitespace
      { include: "@whitespace" },

      // delimiters and operators
      [/[{}()\[\]]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [
        /@symbols/,
        {
          cases: {
            "@operators": "delimiter",
            "@default": "",
          },
        },
      ],

      // dates
      [/\d{4}\.\d{2}\.\d{2}/, "date"],
      [/\d{2}:\d{2}:\d{2}(.\d{1,9})?/, "time"],

      // numbers
      [/\d+\.\d+([eE][\-+]?\d+?)?/, "number.float"],
      [/\d+/, "number"],

      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
      [/"/, "string", "@string"],
    ],

    string: [
      [/[^\\"]+/, "string"],
      [/"/, "string", "@pop"],
    ],

    whitespace: [
      [/[ \t\r\n]+/, ""],
      [/\/[^:].*$/, "comment"],
    ],
  },
};

export default syntax;