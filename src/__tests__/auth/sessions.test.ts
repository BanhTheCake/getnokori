import SessionService from '@/services/auth/session.service'
import { SessionStrategies }from '@/types/auth/session.interface'
import type { IUserModel } from '@/types/accounts/UsersModel.interface'
import AuthService from '@/services/auth/auth.service'

describe('Sessions', () => {
  it('successfully handles session token creation', async () => {
    expect.assertions(5)
    
    const accountId = 'lola.acct.MFhLfpzVt5Uaf4FAyjQ'
    const platformAccountId = 'lola.acct.Ng2kvR5c1WKBHLJfbvekW1'
    const user: IUserModel | null = await AuthService.getUserByEmail(platformAccountId, 'wes+2788@nokori.com')
    if(!user) return

    const session = await SessionService.start(accountId, user, SessionStrategies.PASSWORD)
    if(!session) return

    expect(session.accessToken).toHaveLength(64)
    expect(session.issuedAt).toBeGreaterThan(0)
    expect(session.expiresIn).toBeGreaterThan(0)
    expect(session.expiresAt).toBeGreaterThan(0)

    const nextSession = await SessionService.start(accountId, user, SessionStrategies.PASSWORD)
    
    if(!nextSession) return
    expect(nextSession.accessToken).not.toEqual(session.accessToken)
  })
})
