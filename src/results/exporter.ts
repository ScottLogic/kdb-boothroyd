import { fstat, pathExists } from "fs-extra";
import XLSX from "xlsx";
import * as fs from "fs";

export enum ExportFormat {
  csv = "csv",
  txt = "txt",
  xml = "xml",
  xlsx = "xlsx",
}

export default class Exporter {
  static export(data: any[], format: ExportFormat): string | null {
    if (typeof data === "object") {
      data = Object.entries(data).map(([k, v]) => {
        return {
          key: k,
          value: v,
        };
      });
    }

    let file;
    switch (format) {
      case ExportFormat.csv:
        file = this._exportCSV(data);
        break;
      case ExportFormat.txt:
        file = this._exportTxt(data);
        break;
      case ExportFormat.xml:
        file = this._exportXML(data);
        break;
      case ExportFormat.xlsx:
        file = this._exportXLSX(data);
        break;
    }

    return file;
  }

  static cleanup(file: string) {
    if (file.startsWith("file://")) {
      fs.rm(file.replace(/^file\:\/\//, ""), () => {});
    }
  }

  private static _exportCSV: (data: any[]) => string = (data) => {
    let content = "data:text/csv;charset=utf-8,";

    content += Exporter._concatData(data);

    return content;
  };

  private static _exportTxt: (data: any[]) => string = (data) => {
    let content = "data:text/plain;charset=utf-8,";

    content += Exporter._concatData(data, "\t");

    return content;
  };

  private static _exportXML: (data: any[]) => string = (data) => {
    let content = "data:text/xml;charset=utf-8,";

    let body = data
      .map((r) => {
        let node;
        if (typeof r === "object") {
          node = Object.entries(r)
            .map(([k, v]) => {
              return `    <${k}>${(v as any).toString()}</${k}>`;
            })
            .join("\n");
        } else {
          node = `    ${r}    `;
        }

        return `  <r>\n${node}\n  </r>`;
      })
      .join("\n");

    return content + `<R>\n${body}\n</R>`;
  };

  private static _exportXLSX: (data: any[]) => string = (data) => {
    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");

    let content =
      "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8,";
    XLSX.writeFile(wb, "download.xlsx");
    return "file://" + fs.realpathSync("download.xlsx");
  };

  private static _concatData: (data: any[], separator?: string) => string = (
    data,
    separator = ","
  ) => {
    let concatenated = "";
    if (typeof data[0] === "object") {
      const keys = Object.keys(data[0]) as string[];
      concatenated += keys.join(separator) + "\n";

      concatenated += data
        .map((r: { [key: string]: any }) => {
          const cols: any[] = [];
          keys.forEach((k) => {
            cols.push(r[k]);
          });

          return cols.join(separator);
        })
        .join("\n");
    } else {
      concatenated += data.join("\n");
    }

    return concatenated;
  };
}
