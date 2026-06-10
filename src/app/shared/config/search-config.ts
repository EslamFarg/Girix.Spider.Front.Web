export function  buildSearchPayload(query: string,pageSize: number,column?: number) {

    return {
        "filter": {
          "column": column ?? 0,
          "value": query
        },
        "pagination": {
          "pageIndex": 1,
          "pageSize": pageSize
        }
    }

}