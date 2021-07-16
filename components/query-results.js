// const AgGridVue = require("ag-grid-vue");
const { doc } = require("prettier");

const formatData = (colnames, data) => {
  // Reformat dates as strings
  let newData = [];
  data.forEach((r) => {
    let newRow = {};
    colnames.forEach((c) => {
      newRow[c] =
        r[c] instanceof Date
          ? r[c].toISOString().replaceAll(/[TZ]/g, " ")
          : r[c];
    });
    newData.push(newRow);
  });
  return newData;
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
      gridOptions: undefined,
      tabHeight: 62, //TODO: work this out
    };
  },

  async beforeUnmount() {
    if (this.gridOptions) {
      this.gridOptions.api.destroy();
    }
  },

  computed: {
    textDivStyle() {
      return {
        maxHeight: this.paneHeight - this.tabHeight,
        height: `${this.paneHeight - this.tabHeight}px`,
        overflow: "auto",
        backgroundColor: "white",
        width: "100%",
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
              let agGridColumns;
              this.resText =
                "<pre>" + JSON.stringify(res.data, undefined, 2) + "</pre>";
              if (data.length) {
                if (data[0] instanceof Object) {
                  const colnames = Object.keys(data[0]);
                  this.tableData = formatData(colnames, data);
                  this.columns = colnames.map((c) => ({
                    prop: c,
                    label: c,
                    minWidth: "20px",
                  }));
                  agGridColumns = colnames.map((c) => ({
                    field: c,
                    sortable: true,
                    resizable: true,
                    minWidth: 20,
                  }));
                } else {
                  // Handle non-tabulated results: treat as a single column of data
                  this.columns = [
                    { prop: "value", label: "value", minWidth: "80px" },
                  ];
                  agGridColumns = [{ field: "value", sortable: true }];
                  this.tableData = data.map((v) => {
                    return {
                      value: v,
                    };
                  });
                }
              }
              if (
                this.gridOptions instanceof Object &&
                "columnDefs" in this.gridOptions
              ) {
                this.gridOptions.api.destroy();
              }
              this.gridOptions = {
                columnDefs: agGridColumns,
                rowData: this.tableData,
              };
              const eGridDiv = document.querySelector("#ag-grid");
              new agGrid.Grid(eGridDiv, this.gridOptions);
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
    paneHeight: function (height) {
      const eGridDiv = document.querySelector("#ag-grid");
      this.paneHeight = height;
      eGridDiv.setAttribute("height", height - this.tabHeight);
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
    <el-tab-pane label="AG Grid" name="aggrid">
    <template>
      <div id="ag-grid" class="ag-theme-balham" :style="textDivStyle"></div>
    </template>
    </el-tab-pane>
    <el-tab-pane label="Text" name="txt">
      <div :style="textDivStyle" v-html="resText"></div>
      </el-tab-pane>
    <el-tab-pane label="Message" name="msg">{{ resMsg }}</el-tab-pane>
  </el-tabs>`,
};

module.exports = queryResults;
