const { autoUpdater } = require("electron");

const formatData = (data) => {
  // Q has different types for date, time and datetime but these are all converted to JS Date
  // object by node-q.
  // The only way to know if a datetime is a date or a time is to check if time is zero (=> date)
  // or date is 1 Jan 2000 (=> time, unless the date *really is* 1 Jan 2000....) - so apply
  // some heuristics to work out how to format each column based on the data it contains.
  // see https://www.npmjs.com/package/node-q#types

  const _getDtType = (v) => {
    if (v instanceof Date) {
      if (
        v.getHours() === 0 &&
        v.getMinutes() === 0 &&
        v.getSeconds() === 0 &&
        v.getMilliseconds() === 0
      ) {
        return "date";
      } else if (
        v.getFullYear() === 2000 &&
        v.getMonth() === 0 &&
        v.getDate() === 1
      ) {
        if (v.getMilliseconds() > 0) {
          return "timefull";
        } else {
          return "time";
        }
      } else {
        return "datetime";
      }
    } else {
      return "none";
    }
  };

  const _formatDt = (val, dtType) => {
    if (val instanceof Date) {
      const dtISOStr = val.toISOString();
      const [date, timeFull] = dtISOStr.split("T");
      const [time, millisec] = timeFull.split(".");

      switch (dtType) {
        case "time":
          return time;
          break;
        case "timefull":
          return `${timeFull.replace(/Z$/, "")}`;
        case "date":
          return date;
          break;
        default:
          return `${date} ${time}`;
          break;
      }
    } else {
      return val;
    }
  };

  if (data instanceof Array) {
    const colnames = Object.keys(data[0]);
    let colDtType = {};

    // For each column, if a Date object, establish by empirical means if it contains date, time or datetime
    colnames.forEach((c) => {
      let colDtTypeCount = {};
      colDtTypeCount = data
        .map((r) => r[c])
        .reduce(
          (acc, val) => {
            acc[_getDtType(val)]++;
            return acc;
          },
          { date: 0, time: 0, timefull: 0, datetime: 0, none: 0 }
        );

      // Get largest count and assume that's the datetime type for this column
      colDtType[c] = Object.keys(colDtTypeCount).reduce((a, b) =>
        colDtTypeCount[a] > colDtTypeCount[b] ? a : b
      );
    });

    // Now reformat dates as strings, in-place
    data.forEach((r) => {
      colnames.forEach((c) => {
        if (colDtType[c] !== "none") {
          r[c] = _formatDt(r[c], colDtType[c]);
        }
      });
    });
  }
  return data;
};

const queryResults = {
  props: {
    result: {
      // type: Array,
      required: true,
    },
    paneHeight: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      activeTab: "tbl",
      resText: "",
      resHTML: "",
      resMsg: "",
      columns: [],
      tableData: [],

      tabHeight: 58, //TODO: work this out
    };
  },

  computed: {
    //TODO: work out why this isn't working (div doesn't scroll, only the entire tab pane)
    textDivStyle() {
      return {
        maxHeight: this.paneHeight - this.tabHeight,
        overflow: "auto",
        backgroundColor: "white",
      };
    },
  },

  watch: {
    result: function (res) {
      if (typeof res !== "object") {
        this.resMsg = `ERROR: cannot process result of type ${typeof res}`;
      } else {
        if ("type" in res) {
          if (res.type === "success") {
            this.resMsg = "Success";
            const data = res.data;
            let outputHTML = "";
            if (typeof data == "object") {
              this.resText =
                "<pre>" + JSON.stringify(res.data, undefined, 2) + "</pre>";
              if (data.length) {
                // outputHTML = generateTableHTML(data);
                console.log("About to set table cols/data");
                const colnames = Object.keys(data[0]);
                this.tableData = formatData(data);
                this.columns = colnames.map((c) => {
                  return {
                    prop: c,
                    label: c,
                    minWidth: "20px",
                  };
                });
              } else {
                for (let x in data) {
                  outputHTML += x + " | " + data[x] + "<br />";
                }
              }
              this.activeTab = "tbl";
              console.log("column defs are: " + JSON.stringify(this.columns));
              console.log("tableData is " + JSON.stringify(this.tableData));
            } else {
              this.resText = data;
              this.activeTab = "txt";
            }
            this.resHTML = outputHTML;
          } else {
            this.resMsg = `${res.type}: ${res.data}`;
            this.activeTab = "msg";
          }
        }
      }
    },
  },

  template:
    /*html*/
    `<el-tabs v-model="activeTab" type="card">
    <el-tab-pane label="Table" name="tbl">
    <template>
      <el-table 
        :data="tableData"
        size="mini"
        border
        :max-height="paneHeight - tabHeight"
        empty-text="No Data"
        style="width: 100%;">
        <el-table-column v-for="column in columns" 
                        :key="column.id"
                        :prop="column.prop"
                        :label="column.label"
                        sortable
                        :min-width="column.minWidth">
        </el-table-column>
      </el-table>
    </template>
    </el-tab-pane>
    <el-tab-pane label="Text" name="txt">
      <div :style="textDivStyle" v-html="resText"></div>
      </el-tab-pane>
    <el-tab-pane label="Message" name="msg">{{ resMsg }}</el-tab-pane>
  </el-tabs>`,
};

module.exports = queryResults;
