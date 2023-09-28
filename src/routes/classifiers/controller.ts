import type { NextFunction, Request, Response } from 'express'
import { failure, success } from '@/utils/apiResponse'
import CentroidClassifierService from '@/services/classifiers/CentroidClassifier.service'
import type { ClassifierPredictDto, CreateClassifierDto, TrainClassifierDto } from '@/types/classifiers/dtos.interface'
import { createEmbedding } from '@/services/embeddings/Embeddings.service'
import FrequenciesService from '@/services/frequencies/index'
import BaseMetrics, { MetricsLevel2, MetricsLevel3 } from '@/enums/frequencies/FrequencyMetrics.enums'

const handleGetClassifiers = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const classifiers = await CentroidClassifierService.getMany(platformAccountId)
  if (!classifiers)
    return res.status(200).json(success([]))

  return res.status(200).json(success(classifiers))
}

const handleGetClassifier = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const { classifierId } = req.params
  if(!classifierId)
    return res.status(400).json(failure('No classifier id found'))

  const classifier = await CentroidClassifierService.get(platformAccountId, classifierId)
  if (!classifier)
    return res.status(404).json(failure('Classifier not found'))

  const classes = await CentroidClassifierService.getClasses(platformAccountId, classifierId)
  const result = { ...classifier, classes }

  return res.status(200).json(success(result))
}

const handleCreateClassifier = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const { name }: CreateClassifierDto = req.body
  const classifier = { 
    name: name || `New Classifier - ${new Date().toISOString()}`,
    platformAccountId,
  }
  const created = await CentroidClassifierService.create(classifier)
  if (!created)
    return res.status(500).json(failure('Failed to create classifier'))

  return res.status(200).json(success({ id: created.id, name: classifier.name }))
}

const handleTrainClassifier = async (req: Request, res: Response) => {

  const platformAccountId = req.user.platformAccountId

  const { label, context }: TrainClassifierDto = req.body

  if(!label || !context)
    return res.status(400).json(failure('label and context are required parameters.'))

  const addTrainingExampleResult = await CentroidClassifierService.addTrainingExample(req.user?.accountId, req.params.classifierId, label, context)
  if(!addTrainingExampleResult){
    logger.error('Failed to add training example.')
    return res.status(500).json(failure('Failed to add training example.'))
  }
  res.status(200).json(success(addTrainingExampleResult))

  FrequenciesService.increment(platformAccountId, `${BaseMetrics.BILLING}.${MetricsLevel2.CLASSIFICATION}.${MetricsLevel3.UNITS}`, context.length ?? 1)
  FrequenciesService.increment(platformAccountId, `${BaseMetrics.USAGE}.${MetricsLevel2.CLASSIFICATION}.${MetricsLevel3.UNITS}`, context.length ?? 1)
  
  return true
}

const handleClassifierPredict = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const { context }: ClassifierPredictDto = req.body
  if(!context)
    return res.status(400).json(failure('context is a required parameter.'))

  const words = context.split(' ')

  const classes = await CentroidClassifierService.getClassesWithContext(platformAccountId, req.params.classifierId)
  if(!classes){
    logger.error('No classes found for classifier.')
    return res.status(500).json(failure('No classes found for classifier.'))
  }

  const embeddedContext = await createEmbedding(context)
  if(!embeddedContext){
    logger.error('Failed to create embedding for context.')
    return res.status(500).json(failure('Prediction failed.'))
  }

  FrequenciesService.increment(platformAccountId, `${BaseMetrics.BILLING}.${MetricsLevel2.CLASSIFICATION}.${MetricsLevel3.UNITS}`, words.length ?? 1)
  
  const prediction = await CentroidClassifierService.predict(embeddedContext, classes)
  if(!prediction){
    logger.error('Prediction failed.')
    return res.status(500).json(failure('Prediction failed.'))
  }

  res.status(200).json(success(prediction))
  
  FrequenciesService.increment(platformAccountId, `${BaseMetrics.USAGE}.${MetricsLevel2.CLASSIFICATION}.${MetricsLevel3.UNITS}`, words.length ?? 1)
}

const handleDeleteClassifier = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const { classifierId } = req.params
  if(!classifierId)
    return res.status(400).json(failure('No classifier id found'))

  const deleted = await CentroidClassifierService.deleteClassifier(platformAccountId, classifierId)
  if(!deleted)
    return res.status(500).json(failure('Failed to delete classifier'))

  return res.status(200).json(success())
}

const handleDeleteClass = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const { classifierId, classId } = req.params
  if(!classifierId || !classId)
    return res.status(400).json(failure('No classifier or class id found'))

  const deleted = await CentroidClassifierService.deleteClass(platformAccountId, classifierId, classId)
  if(!deleted)
    return res.status(500).json(failure('Failed to delete class'))

  return res.status(200).json(success())
}

export default {
  handleClassifierPredict,
  handleCreateClassifier,
  handleDeleteClass,
  handleDeleteClassifier,
  handleGetClassifier,
  handleGetClassifiers,
  handleTrainClassifier,
}
