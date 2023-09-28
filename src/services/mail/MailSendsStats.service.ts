import MailSendsStatsRepo from '@/repositories/mail/MailSendsStats.repo'

const getSendsStats = async (accountId: string, status: string, from: string, to: string): Promise<any | null> => {
  return await MailSendsStatsRepo.getSendsStats(accountId, status, from, to)
}

export default {
  getSendsStats,
}
