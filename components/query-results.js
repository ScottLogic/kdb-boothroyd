const { autoUpdater } = require("electron");
const { dates } = require("node-q");

const formatData = (colnames, data) => {
  // Reformat dates as strings, in-place
  data.forEach((r) => {
    colnames.forEach((c) => {
      if (r[c] instanceof Date) {
        r[c] = r[c].toISOString().replaceAll(/[TZ]/g, " ");
      }
    });
  });
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

      tabHeight: 62, //TODO: work this out
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
                if (data[0] instanceof Object) {
                  const colnames = Object.keys(data[0]);
                  this.tableData = formatData(colnames, data);
                  this.columns = colnames.map((c) => {
                    return {
                      prop: c,
                      label: c,
                      minWidth: "20px",
                    };
                  });
                } else {
                  // Handle non-tabulated results: treat as a single column of data
                  this.columns = [
                    { prop: "value", label: "value", minWidth: "80px" },
                  ];
                  this.tableData = data.map((v) => {
                    return {
                      value: v,
                    };
                  });
                }
              }
              this.activeTab = "tbl";
            } else {
              const dt = new Date();
              this.resText = `<pre>${dt
                .toISOString()
                .replaceAll(/(T|\.\d+Z$)/g, " ")}<br>${data}</pre>`;
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
