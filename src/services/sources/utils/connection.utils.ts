
export const closeConnection = async (DBInstance: any) => {
  if(DBInstance.closeConnection){
    DBInstance.closeConnection()
    return true
  }

  if(DBInstance.closeConnectionSync){
    await DBInstance.closeConnectionSync()
    return true
  }
}

export default {
  closeConnection,
}
