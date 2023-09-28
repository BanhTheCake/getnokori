import ClassifiersRepo from '@/repositories/classifiers/Classifiers.repo'
import ClassifiersClassesRepo from '@/repositories/classifiers/ClassifiersClasses.repo'
import type { ClassifierClassContext, ClassifierClassRow, ClassifierRow } from '@/types/classifiers/classifiers.interface'
import { classifierClassId, classifierId } from '@/utils/ids'
import { createEmbedding } from '@/services/embeddings/Embeddings.service'
import { cosineSimilarity, rollingAverage } from '@/services/vectors/Vectors.service'

const create = async (classifier: Omit<ClassifierRow, 'classifierId'>): Promise<{id: string} | null> => {
  const id = classifierId()
  const row = { ...classifier, classifierId: id }
  const created = await ClassifiersRepo.create(row)
  if(created)
    return { id }

  return null
}

const get = async (account: string, classifierId: string): Promise<ClassifierRow | null> => {
  const classifier = await ClassifiersRepo.get(account, classifierId)
  if(!classifier)
    return null

  const { accountId, active, ...classifierResult } = classifier

  return classifierResult
}

const getMany = async (account: string): Promise<ClassifierRow[] | null> => {
  return await ClassifiersRepo.getMany(account)
}

// const update = async (accountId: string, classifierId: string, classifier: ClassifierRow): Promise<boolish> => {

// }

// const archive = async (accountId: string, classifierId: string): Promise<boolish> => {

// }

const getClasses = async (accountId: string, classifierId: string): Promise<ClassifierClassRow[] | null> => {
  const classes = await ClassifiersClassesRepo.getClasses(accountId, classifierId)
  if(!classes)
    return []

  return classes
}

const getClassesWithContext = async (accountId: string, classifierId: string): Promise<ClassifierClassRow[] | null> => {
  const classes = await ClassifiersClassesRepo.getClassesWithContext(accountId, classifierId)
  if(!classes)
    return []

  return classes
}

const createClass = async (
  accountId: string,
  classifierId: string,
  label: string,
  context: number[]):
Promise<{classId: string} | null> => {
  const classContext: ClassifierClassContext = {
    sumVector: context,
    centroid: context,
  }
  const row: ClassifierClassRow = { 
    classId: classifierClassId(),
    accountId, 
    classifierId, 
    label, 
    context: JSON.stringify(classContext),
    observations: 1, 
  }

  const created = await ClassifiersClassesRepo.create(row)
  if(created)
    return { classId: row.classId }

  return null
}

const updateClassContext = async (
  accountId: string,
  classifierId: string,
  classId: string,
  context: string,
  observations: number):
Promise<boolish> => {
  return await ClassifiersClassesRepo.updateClass(accountId, classifierId, classId, context, observations)
}

const addTrainingExample = async (
  accountId: string, 
  classifierId: string, 
  label: string,
  context: string): 
Promise<{classId: string; observations: number} | null> => {
  const existingClass = await ClassifiersClassesRepo.getClass(accountId, classifierId, label)
  if(!existingClass){
    const embeddedExample = await createEmbedding(context)
    if(!embeddedExample){
      logger.error('Failed to create embedding for training example.')
      return null
    }

    const created = await createClass(accountId, classifierId, label, embeddedExample)
    if(created)
      return { ...created, observations: 1 }

    return null
  }

  const classContext = existingClass.context
  const sumVector = typeof classContext === 'string' ? JSON.parse(classContext).sumVector : classContext.sumVector
  
  // We are adding a new observation, so we need to increment by 1 to compute the new centroid accurately.
  const incrementedObservations = existingClass.observations + 1

  const embeddedExample = await createEmbedding(context)
  if(!embeddedExample){
    logger.error('Failed to create embedding for training example.')
    return null
  }

  const newCentroid = await rollingAverage(sumVector, embeddedExample, incrementedObservations)
  if(!newCentroid){
    logger.error('Failed to create new centroid for class.')
    return null
  }

  const newContext: ClassifierClassContext = {
    sumVector: newCentroid.sumVector,
    centroid: newCentroid.centroid,
  }
  const didUpdateClass = await updateClassContext(accountId, classifierId, existingClass.classId, JSON.stringify(newContext), incrementedObservations)
  if(!didUpdateClass){
    logger.error('Failed to update class context.')
    return null
  }
  // Get existing and update it
  return { classId: existingClass.classId, observations: incrementedObservations }
}

interface CentroidClassifierPredictResult {
  classId: string
  label: string
  confidence: number
}
const predict = async (sourceVector: number[], classes: ClassifierClassRow[]): Promise<CentroidClassifierPredictResult | null> => {

  let result: ClassifierClassRow | null = null
  let classSimilarity = -1000

  const similarityPromises = classes.map(async (classifierClass) => {
    const centroid = typeof classifierClass.context === 'string' ? JSON.parse(classifierClass.context).centroid : classifierClass.context.centroid
    return { classifierClass, similarity: await cosineSimilarity(sourceVector, centroid) }
  })
  
  const results = await Promise.all(similarityPromises)
  
  for (const { classifierClass, similarity } of results) {
    if(similarity?.value){
      if(similarity.value > classSimilarity){
        classSimilarity = similarity.value
        result = classifierClass
      }
    }
  }

  if(!result) return null

  return {
    classId: result.classId,
    label: result.label,
    confidence: classSimilarity > 1 ? 1 : classSimilarity, // clip at 100%
  }
}

const deleteClassifier = async (accountId: string, classifierId: string): Promise<boolish> => {

  try{
    await ClassifiersRepo.archive(accountId, classifierId)
    await ClassifiersClassesRepo.deleteAll(accountId, classifierId)
  }
  catch(error: any){
    logger.error('Error deleting classifier', error)
    return null
  }

  return true
}

const deleteClass = async (accountId: string, classifierId: string, classId: string): Promise<boolish> => {
  return await ClassifiersClassesRepo.deleteClass(accountId, classifierId, classId)
}

export default {
  create,
  get,
  getMany,
  getClasses,
  getClassesWithContext,
  addTrainingExample,
  predict,
  deleteClass,
  deleteClassifier,
}
