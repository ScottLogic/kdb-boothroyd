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
    };
  },

  methods: {
    handleClick(tab, event) {
      console.log(`Hook for click on tab: ${tab.label}`);
      if (tab.label === "Raw") {
        console.log(this.result);
      }
    },
  },

  watch: {
    result: function (res, oldRes) {
      console.log("watcher called");
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
                outputHTML = generateTableHTML(data);
              } else {
                for (let x in data) {
                  outputHTML += x + " | " + data[x] + "<br />";
                }
              }
              this.activeTab = "tbl";
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
    `<el-tabs v-model="activeTab" type="card" @tab-click="handleClick">
    <el-tab-pane label="Table" name="tbl"><div v-html="resHTML"></div></el-tab-pane>
    <el-tab-pane label="Text" name="txt"><div v-html="resText"></div></el-tab-pane>
    <el-tab-pane label="Message" name="msg">{{ resMsg }}</el-tab-pane>
  </el-tabs>`,
};

module.exports = { queryResults };
