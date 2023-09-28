
interface EntityDefinitionDto {
  dataType: string | null
  defaultValue?: string | null
  extra?: string | null
  fieldKey?: string | null
  fieldName: string | null
  enumerations?: string[] | null
  isNullable: true | null
  isPrimaryKey: true | null
  tsType: string | null
}

export default EntityDefinitionDto
