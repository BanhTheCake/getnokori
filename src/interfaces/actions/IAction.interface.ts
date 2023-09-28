// export declare type GenericValue = string | object | number | boolean | undefined | null
// export interface IDataObject {
//   [key: string]: GenericValue | IDataObject | GenericValue[] | IDataObject[]
// }

// export interface IActionExecutionData {
//   [key: string]: IDataObject
//   json: IDataObject
// }

interface IAction {
  run(params: any): void
}

export default IAction
