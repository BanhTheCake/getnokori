import db from '@/models/mysql'

const createInvite = async (
  invite_code: string, 
  email: string, 
  accountId: string,
  referringUserId: string): 
Promise<true | null> => {
  const result = await db.pool.query(
    `INSERT INTO account_invites 
      SET 
        accountId = ?,
        inviteCode = ?, 
        email = ?, 
        referringUserId = ?, 
        created_at = CURRENT_TIMESTAMP(), 
        expires_at = DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 2 DAY)`,
    [accountId, invite_code, email, referringUserId],
  )
  return result.affectedRows > 0 ? true : null
}

const getInviteByCode = async (inviteCode) => {
  const result = await db.pool.query(
    'SELECT * FROM user_invites WHERE inviteCode = ? and redeemedAt is null',
    [inviteCode],
  )
  return result.length ? result[0] : null
}

const getInviteByEmail = async (email, referringUser) => {
  const result = await db.pool.query(
    'SELECT * FROM user_invites WHERE email = ? and referringUserId = ?',
    [email, referringUser],
  )
  return result.length ? result[0] : null
}

const updateInvite = async (
  inviteCode: string, 
  invite: string): 
Promise<true | null> => {
  const query = 'UPDATE user_invites SET ? WHERE inviteCode = ?'
  const result = await db.query(query, [invite, inviteCode])
  return result.affectedRows > 0 ? true : null
}

export default {
  createInvite,
  getInviteByCode,
  getInviteByEmail,
  updateInvite,
}
