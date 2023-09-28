import SQLBasedRunner from '@/services/queries/runners/SQLBased.runner.service'
import EngineTypes from '@/enums/sources/engines/engineTypes.enum'
import HTTPBasedRunner from '@/services/queries/runners/HTTPBased.runner.service'

export default class RunnerFactory {

  static getRunner(engine: string): any {
    switch (engine) {
      case EngineTypes.MYSQL:
      case EngineTypes.POSTGRES:
      case EngineTypes.MARIADB:
        return SQLBasedRunner
        break
    
      case EngineTypes.HTTP:
        return HTTPBasedRunner

      default:
        return null
        break
    }
  }

}
