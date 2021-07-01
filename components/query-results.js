function generateTableHTML(data) {
  let tableHTML = '<table border="1"><tr>';
  if (typeof data[0] == "object") {
    tableHTML += Object.keys(data[0])
      .map((x) => `<th>${x}</th>`)
      .join("");
    tableHTML += "</tr>";
    tableHTML += data
      .map(
        (row) =>
          `<tr>${Object.values(row)
            .map((cell) => `<td>${cell}</td>`)
            .join("")}</tr>`
      )
      .join("");
  } else {
    tableHTML += data.map((x) => `<td>${x}</td>`).join("");
  }
  tableHTML += "</table>";
  return tableHTML;
}

const queryResults = {
  props: ["result"],

  data() {
    return {
      activeTab: "tbl",
      resText: "",
      resHTML: "",
      resMsg: "",
      columns: [{ id: "1", label: "placeholder", prop: "col" }],
      tableData: [{ col: "lorem ipsum" }],
    };
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
                this.tableData = data;
                this.columns = colnames.map((c) => {
                  return {
                    prop: c,
                    label: c,
                    minWidth: "180px",
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
              this.tableData = [{ col1: "lorem ipsum" }]; //TODO: temp
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
        style="width: 100%;">
        <el-table-column v-for="column in columns" 
                        :key="column.id"
                        :prop="column.prop"
                        :label="column.label"
                        :min-width="column.minWidth">
        </el-table-column>
      </el-table>
    </template>
    </el-tab-pane>
    <el-tab-pane label="Text" name="txt">
      <div v-html="resText"></div>
      </el-tab-pane>
    <el-tab-pane label="Message" name="msg">{{ resMsg }}</el-tab-pane>
  </el-tabs>`,
};

module.exports = { queryResults };
