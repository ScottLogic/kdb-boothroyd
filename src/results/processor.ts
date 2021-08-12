import { IColumn } from "@fluentui/react";

export class ResultsProcessor {
  // Main entrypoint, either returns a flat string or a tuple of columns and headers
  static process(
    results: any,
    start: number = 0,
    limit: number = 30,
    sortColumn: string = "|i|",
    sortDirection: "asc" | "desc" = "asc"
  ): string | [Array<IColumn>, Array<{} | null>] {
    let cols: IColumn[] = [],
      rows: Array<{} | null> = [],
      sorted: Array<{} | null> = [];

    // Get the type of our results
    if (Array.isArray(results)) {
      // We have a list of results, lets convert them to our format for details list
      if (results.length > 0) {
        sorted = this.copyAndSort(
          this.preprocessData(results),
          sortColumn,
          sortDirection == "desc"
        );
        cols = this.prepareHeaders(results[0], true, sortColumn, sortDirection);
        rows = this.prepareRows(
          (sorted as Array<any>).slice(start, start + limit),
          start
        );

        if (results.length > start + limit) rows.push(null);
      }
      return [cols, rows];
    } else if (typeof results === "object") {
      const prepped = Object.entries(results).map(([k, v]) => {
        return {
          key: k,
          value: v,
        };
      });
      sorted = this.copyAndSort(
        this.preprocessData(prepped),
        sortColumn,
        sortDirection == "desc"
      );
      cols = this.prepareHeaders(
        { key: "", value: "" },
        false,
        sortColumn,
        sortDirection
      );
      rows = this.prepareRows(sorted);
      return [cols, rows];
    } else if (typeof results === "string") {
      // If it's a string just return it as is
      return results;
    } else {
      // If we can't do anything with the results return an error and results as string
      return `Resultset could not be parsed.\n\n${JSON.stringify(results)}`;
    }
  }

  static prepareHeaders(
    resultItem: any,
    includeIndex: boolean = true,
    sortColumn: string,
    sortDirection: string
  ): Array<IColumn> {
    const cols: IColumn[] = [];

    if (includeIndex) {
      // Add index column
      cols.push({
        key: "index",
        name: "#",
        fieldName: "|i|",
        minWidth: 30,
        isRowHeader: false,
        isResizable: true,
        isSorted: sortColumn == "|i|",
        isSortedDescending: sortColumn == "|i|" && sortDirection == "desc",
        sortAscendingAriaLabel: "Sorted ASC",
        sortDescendingAriaLabel: "Sorted DESC",
        data: Number,
      });
    }

    if (typeof resultItem === "object") {
      // Set column headers
      Object.entries(resultItem).forEach(([k, v]) => {
        cols.push({
          key: k.toLowerCase(),
          name: k.toUpperCase(),
          fieldName: k,
          minWidth: 100,
          isRowHeader: false,
          isResizable: true,
          isSorted: sortColumn == k,
          isSortedDescending: sortColumn == k && sortDirection == "desc",
          sortAscendingAriaLabel: "Sorted ASC",
          sortDescendingAriaLabel: "Sorted DESC",
          data: typeof v,
        } as IColumn);
      });
    } else {
      cols.push({
        key: "value",
        name: "Value",
        fieldName: "value",
        minWidth: 10,
        maxWidth: 200,
        isRowHeader: true,
        isResizable: true,
        isSorted: sortColumn == "value",
        isSortedDescending: sortColumn == "value" && sortDirection == "desc",
        sortAscendingAriaLabel: "Sorted ASC",
        sortDescendingAriaLabel: "Sorted DESC",
        data: typeof resultItem,
        isPadded: true,
      });
    }

    return cols;
  }

  static prepareRows(results: Array<any>, start: number = 0): Array<{}> {
    const rows: {}[] = [];

    results.forEach((v: any, i: number) => {
      if (typeof v === "object") {
        const parsed: { [key: string]: string } = {};

        for (let k in v) {
          parsed[k] = `${v[k]}`;
        }
        rows.push({
          ...parsed,
        });
      } else {
        rows.push({
          "|i|": i + 1 + start,
          value: v,
        });
      }
    });

    return rows;
  }

  static preprocessData<T>(items: T[]) {
    return items.map((r, i) => {
      const item = {
        "|i|": i + 1,
      };
      if (typeof r == "object") {
        return {
          ...item,
          ...r,
        };
      } else {
        return {
          ...item,
          value: r,
        };
      }
    });
  }

  static copyAndSort<T>(
    items: T[],
    columnKey: string,
    isSortedDescending?: boolean
  ): T[] {
    if (typeof items[0] == "object") {
      const key = columnKey as keyof T;
      return items
        .slice(0)
        .sort((a: T, b: T) =>
          (isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1
        );
    } else {
      return items;
    }
  }
}
