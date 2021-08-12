import { IColumn } from "@fluentui/react"
import { ColDef } from "ag-grid-community"

export class ResultsProcessor {

  // Main entrypoint, either returns a flat string or a tuple of columns and headers
  static process(
    results:any
    ): string | [Array<ColDef>, Array<{} | null>]  {

    let cols:ColDef[] = [], 
        rows:Array<{} | null> = []

    
    // Get the type of our results
    if (Array.isArray(results)) {
        // We have a list of results, lets convert them to our format for details list
        if (results.length  > 0) {
          cols = this.prepareHeaders(results[0], true)
          rows = this.prepareRows(results)
        }
        return [cols, rows]
    } else if (typeof results === "object") {
      rows = Object.entries(results).map(([k,v]) => {
        return {
          key:k,
          value: v
        }
      })
      //sorted = this.copyAndSort(this.preprocessData(prepped), sortColumn, sortDirection == "desc")
      cols = this.prepareHeaders({key:"",value:""}, false)
      return [cols, rows]
    } else if (typeof results === "string") {
      // If it's a string just return it as is
      return results
    } else {
      // If we can't do anything with the results return an error and results as string
      return `Resultset could not be parsed.\n\n${JSON.stringify(results)}`
    }

  }

  static prepareHeaders(resultItem:any, includeIndex:boolean = true): Array<ColDef> {

    const cols:ColDef[] = []

    if (includeIndex) {
      // Add index column
      cols.push({
        headerName: "#",
        field:"|i|",
        width: 100,
        filter: false
      })
    }

    if (typeof resultItem === "object") {
      // Set column headers
      Object.entries(resultItem).forEach(([k,v]) => {
        cols.push({
          field: k
        })
      })
    } else {
      cols.push({
        field: "value"
      })
    }

    return cols
  }

  static prepareRows(results:any[]) {
    if (typeof results[0] == "object") {
      return results.map((r, i) =>{
        return {
          "|i|": i + 1,
          ...r
        }
      })
    } else {
      return results
    }

  }

}