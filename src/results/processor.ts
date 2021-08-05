import { IColumn } from "@fluentui/react"

export class ResultsProcessor {

  // Main entrypoint, either returns a flat string or a tuple of columns and headers
  static process(results:any, start:number = 0, limit:number = 30): string | [Array<IColumn>, Array<{} | null>]  {

    let cols:IColumn[] = [], 
        rows:Array<{} | null> = []
        
    // Get the type of our results
    if (Array.isArray(results)) {
        // We have a list of results, lets convert them to our format for details list
        if (results.length  > 0) {
          cols = this.prepareHeaders(results[0])
          rows = this.prepareRows((results as Array<any>).slice(start,start + limit), start)

          if (results.length > (start + limit))
            rows.push(null)
        }
        return [cols, rows]
    } else if (typeof results === "object") {
      cols = this.prepareHeaders({key:"",value:""}, false)
      rows = this.prepareRows(Object.entries(results).map(([k,v]) => {
        return {
          key:k,
          value: v
        }
      }))
      return [cols, rows]
    } else if (typeof results === "string") {
      // If it's a string just return it as is
      return results
    } else {
      // If we can't do anything with the results return an error and results as string
      return `Resultset could not be parsed.\n\n${JSON.stringify(results)}`
    }

  }

  static prepareHeaders(resultItem:any, includeIndex:boolean = true): Array<IColumn> {

    const cols:IColumn[] = []

    if (includeIndex) {
      // Add index column
      cols.push({
        key: "index",
        name: "",
        fieldName:"|i|",
        minWidth:10,
        maxWidth:50,
        isRowHeader: true,
        isResizable: true,
        isSorted: false,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'Sorted ASC',
        sortDescendingAriaLabel: 'Sorted DESC',
        data: Number,
        isPadded: true
      })
    }

    if (typeof resultItem === "object") {
      // Set column headers
      Object.entries(resultItem).forEach(([k,v]) => {
        cols.push({
          key: k.toLowerCase(),
          name: k.toUpperCase(),
          fieldName: k,
          minWidth:10,
          maxWidth:200,
          isRowHeader: false,
          isResizable: true,
          isSorted: false,
          isSortedDescending: false,
          sortAscendingAriaLabel: 'Sorted ASC',
          sortDescendingAriaLabel: 'Sorted DESC',
          data: typeof v,
          isPadded: true
        } as IColumn)
      })
    } else {
      cols.push({
        key: "value",
        name: "Value",
        fieldName:"value",
        minWidth:10,
        maxWidth:200,
        isRowHeader: true,
        isResizable: true,
        isSorted: false,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'Sorted ASC',
        sortDescendingAriaLabel: 'Sorted DESC',
        data: typeof resultItem,
        isPadded: true
      })
    }

    return cols
  }

  static prepareRows(results:Array<any>, start:number = 0): Array<{}> {

    const rows:{}[] = []

    results.forEach((v:any, i:number) =>{
      const item = {
        "|i|": i + 1 + start
      }

      if (typeof v === "object") {
        const parsed:{[key: string]:string} = {}

        for (let k in v)  {
          parsed[k] = `${v[k]}`
        }
        rows.push({
          ...item,
          ...parsed
        })
      } else {
        rows.push({
          ...item,
          value:v
        })
      }
    })

    return rows

  }
}