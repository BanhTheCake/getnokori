import { customAlphabet } from 'nanoid'
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-'
const alphabetUpperCase = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 16)

export const random = (n: number = 19): string =>{
  return customAlphabet(alphabet, n)()
}

const alphanumeric = (n: number = 19): string =>{
  return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', n)()
}

export const apiKey = (): string =>{
  return `nk_pk_prod_${random(36)}`
}

export const actionId = (): string => {
  return `act.${random()}`
}

export const triggerId = (): string => {
  return `trg.${random()}`
}

export const queryId = (): string => {
  return `q.${random()}`
}

export const inviteId = (): string =>{
  return `${alphabetUpperCase()}`
}

export const sourceId = (): string =>{
  return `src.${random()}`
}

export const userId = (): string =>{
  return `user.${random()}`
}

export const hubId = (): string =>{
  return `hub.${random()}`
}

export const hubNodeId = (): string =>{
  return `hnd.${random()}`
}

export const hubRoot = (): string =>{
  return `hrt.${random()}`
}

export const logId = (): string =>{
  return `log.${random(23)}`
}

export const emailVerifyId = (): string =>{
  return `${random()}`
}

export const passResetId = (): string =>{
  return `${random()}`
}

/**
 * Returns: `acct.{random}`
 */
export const accountId = (): string =>{
  return `acct.${random()}`
}

export const authEventId = (): string =>{
  return `aevt.${random()}`
}

export const billingPlanId = (): string =>{
  return `bpln.${random()}`
}

export const billingPlanGroupId = (): string =>{
  return `bgrp.${random()}`
}

export const classifierId = (): string =>{
  return `clfr.${random()}`
}

export const classifierClassId = (): string =>{
  return `clfc.${random()}`
}

export const journalDocId = (): string => {
  return `bjid.${random()}`
}

export const emailId = (): string => {
  return `email.${alphanumeric(25)}`
}

export const emailLogId = (): string => {
  return `email.log.${random(34)}`
}

export const domainVerificationKey = (): string => {
  return `dkey.${random(36)}`
}

export default {
  accountId,
  apiKey,
  billingPlanGroupId,
  billingPlanId,
  hubId,
  hubNodeId,
  hubRoot,
  logId,
  queryId,
  sourceId,
  random,
  userId,
}
