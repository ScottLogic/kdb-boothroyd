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
      if (result.type === "success") {
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
      if (result.type === "error") {
      }
    },
  },

  template: `<div v-html="convertToHTML(result)">
    </div>`,
};

module.exports = { queryResults };
