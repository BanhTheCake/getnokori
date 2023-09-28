import db from '@/models/mysql'

const getSendsStats = async (accountId: string, status: string, from: string, to: string): Promise<any | null> => {
  const query = `
  SELECT DATE(createdAt) as date, count(*) as count FROM mail_sends 
  WHERE accountId = ? AND DATE(createdAt) BETWEEN ? AND ?
  AND status = ?
  GROUP BY status, DATE(createdAt) ORDER BY DATE(createdAt) DESC
  `
  const results = await db.query(query, [accountId, from, to, status])
  return results ? results : null
}

export default {
  getSendsStats,
}
