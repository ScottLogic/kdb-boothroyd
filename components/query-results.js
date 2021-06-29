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

  methods: {
    convertToHTML(result) {
      if (result && result.type === "success") {
        const data = result.data;
        let outputHTML = "";
        if (typeof data == "object") {
          if (data.length) {
            outputHTML = generateTableHTML(data);
          } else {
            for (let x in data) {
              outputHTML += x + " | " + data[x] + "<br />";
            }
          }
        } else {
          outputHTML = data;
        }
        return outputHTML;
      }
    },
    formatResult(result, resType) {
      //TODO: Wed - finish this off
      if (typeof result != "string") {
        const jsonPretty =
          "<pre>" + JSON.stringify(result, undefined, 2) + "</pre>";
        if (resType === "json") {
          return jsonPretty;
        } else if (resType === "raw") {
          return typeof result;
        }
      } else {
        return result;
      }
    },
    handleClick(tab, event) {
      console.log(`Hook for click on tab: ${tab.label}`);
      if (tab.label === "Raw") {
        console.log(this.result);
      }
    },
  },

  // template: `<div v-html="convertToHTML(result)">
  //   </div>`,

  template:
    /*html*/
    `<el-tabs type="card" @tab-click="handleClick">
    <el-tab-pane label="Table"><div v-html="convertToHTML(result)"></div></el-tab-pane>
    <el-tab-pane label="JSON"><div v-html="formatResult(result, 'json')"></div></el-tab-pane>
    <el-tab-pane label="Raw"><div v-html="formatResult(result, 'raw')"></div></el-tab-pane>
    <el-tab-pane label="Message">Placeholder for errors</el-tab-pane>
  </el-tabs>`,
};

module.exports = { queryResults };
