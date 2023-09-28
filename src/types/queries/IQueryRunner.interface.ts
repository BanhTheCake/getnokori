interface IQueryRunnerResult{
  data: any
  error: any | null
}

export interface IQueryRunner { 

  run(): Promise<IQueryRunnerResult>
}
