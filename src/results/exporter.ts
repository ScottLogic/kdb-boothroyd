export enum ExportFormat {
  csv = "csv",
  txt = "txt"
}

export default class Exporter {
  static export(data: any[], format: ExportFormat) {

    let file
    switch (format) {
      case ExportFormat.csv:
        file = this._exportCSV(data)
        break
      case ExportFormat.txt:
        file = this._exportTxt(data)
        break
    }

    return file
  }

  private static _exportCSV:(data:any[]) => string = (data) => {
    let content = "data:text/csv;charset=utf-8,"

    content += Exporter._concatData(data)

    return content
  }

  private static _exportTxt:(data:any[]) => string = (data) => {
    let content = "data:text/plain;charset=utf-8,"

    content += Exporter._concatData(data, "\t")

    return content
  }

  private static _concatData:(data:any[], separator?:string) => string = (data, separator = ",") => {
    let concatenated = ""
    if (typeof data[0] === "object") {
      const keys = Object.keys(data[0]) as string[]
      concatenated += keys.join(separator) + "\n"

      concatenated += data.map((r:{[key:string]:any}) => {
        const cols:any[] = []
        keys.forEach((k) => {
          cols.push(r[k])
        })

        return cols.join(separator)
      }).join("\n")
    } else {
      concatenated += data.join("\n")
    }

    return concatenated
  }
}