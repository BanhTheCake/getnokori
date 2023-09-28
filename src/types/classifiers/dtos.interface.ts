export interface CreateClassifierDto {
  name?: string
}

export interface TrainClassifierDto {
  label: any
  context: string
}

export interface ClassifierPredictDto {
  context: string
}
