// import { inviteId } from '@/utils/ids'
// import InviteRepository from '@/repositories/accounts/invites.repo'
// // const ProfileService = require('./profile')
// import MailService from '@/services/email'
// // const UserService = require('./user')
// import EmailTemplates from '@/enums/messages/emailTemplates.enum'
// import InviteTypes from '@/enums/auth/inviteCodeTypes.enum'

// const createInvite = async (email, referringUser) => {
//   const existingUser = await UserService.getUserByEmailInternal(email)

//   if (existingUser) 
//     return false

//   let invite = await InviteRepository.getInviteByEmail(email, referringUser)

//   if (!invite) {
//     const inviteCode = nanoid(16)
//     const createSuccess = await InviteRepository.createInvite(inviteCode, email, referringUser)
//     if (!createSuccess) {
//       Logger.error('Error creating invite', {
//         email,
//         referringUser,
//       })
//       return false
//     }
//     invite = await InviteRepository.getInviteByEmail(email, referringUser)
//   }

//   if (invite) {
//     const referringUserProfile = await UserService.getUserByIdInternal(referringUser)

//     const text = `Hi there!
    
//       ${
//   referringUserProfile.display_name || 'Someone'
// } has sent you an exclusive invite to Pulse - the first-ever social network designed just for the vacation rental industry. Can't wait for you to be a part of it!
      
//       ${process.env.PULSE_APP_URL}/sign-up?invite_code=${invite.invite_code}
      
//       If you did not request an invite to Nokori Pulse, then disregard this email and your invite will expire in 48 hours.`

//     // send email to user with invite link
//     try {
//       await MailService.send({
//         from: 'Pulse Invitations <invites@nokori.com>',
//         to: email,
//         subject: referringUserProfile.display_name ?
//           `${referringUserProfile.display_name} has sent you an exclusive Pulse invite!` :
//           'Someone sent you an exclusive Pulse invite!',
//         template: EmailTemplateNames.InviteSignup,
//         text,
//         variables: {
//           link: `${process.env.PULSE_APP_URL}/sign-up?invite_code=${invite.invite_code}`,
//           referrer_name: referringUserProfile.display_name || 'Emmet',
//           referrer_avatar:
//             `${referringUserProfile.avatar ||
//               'https://images.nokori.com/static/email/pulse/images/emmet.jpg' 
//             }?crop=faces%2Ccenter&fit=crop&w=128&h=128&facepad=40&mask=ellipse&fm=png`,
//           referrer_username: referringUserProfile.username || 'emmet',
//           referrer_job_title: referringUserProfile.co_role || '',
//           referrer_company: referringUserProfile.co_name || '',
//           referrer_invites_remaining: 5,
//         },
//       })
//     }
//     catch (error) {
//       Logger.error(error)
//     }

//     return true
//   }

//   return false
// }

// const getInviteByCode = async (inviteCode) => {
//   const invite = await InviteRepository.getInviteByCode(inviteCode)
//   return invite
// }

// const isInviteValid = async (inviteCode, invite_type) => {
//   switch (invite_type) {
//     case INVITE_CODE_TYPE.Referral: {
//       const invite = await InviteRepository.getInviteByCode(inviteCode)
//       if (!invite) 
//         return false
      
//       const existingUser = await UserService.getUserByEmailInternal(invite.email)
//       return !!invite && !existingUser
//     }
//     case INVITE_CODE_TYPE.PersonalLink: {
//       const userId = getUserIdFromPersonalInviteCode(inviteCode)
//       const existingUser = await UserService.getUserByIdInternal(userId)
//       return existingUser && existingUser.user_id === userId
//     }
//   }
// }

// const getInviteByEmail = async (email, referringUser) => {
//   const invite = await InviteRepository.getInviteByEmail(email, referringUser)
//   return invite
// }

// const updateInvite = async (inviteCode, invite) => {
//   const updatedInvite = await InviteRepository.updateInvite(inviteCode, invite)
//   return updatedInvite
// }

// const markInviteAsRedeemed = async (inviteCode, redeemedUserId) => {
//   const invite = {
//     redeemed_at: new Date(),
//     redeemed_user_id: redeemedUserId,
//   }
//   const updatedInvite = await InviteRepository.updateInvite(inviteCode, invite)
//   return updatedInvite
// }

// const getRemainingInviteCount = async (user_id) => {
//   const invite = await InviteRepository.getRemainingInviteCount(user_id)
//   return invite
// }

// const updateRemainingInvites = async (userId, inviteCount) => {
//   const updatedProfile = await ProfileService.updateProfile(userId, {
//     invites_remaining: inviteCount,
//   })

//   return !!updatedProfile
// }

// const getPeopleIReferredByEmail = async (email) => {
//   const inviteRows = await InviteRepository.getPeopleIReferred(email)

//   if (!inviteRows || !inviteRows.length) 
//     return []

//   const emails = inviteRows.map(row => row.email)
//   const profiles = await UserService.getUsersByEmailInternal(emails)

//   return profiles
// }

// const getPersonalInviteLinkForUserId = (userId) => {
//   const [prefix, nanoId] = userId.split('.')
//   return `${process.env.PULSE_APP_URL}/sign-up?invite_code_user=${nanoId}`
// }

// const getUserIdFromPersonalInviteCode = (personalInviteCode) => {
//   return `uid.${personalInviteCode}`
// }

// module.exports = {
//   createInvite,
//   getInviteByCode,
//   isInviteValid,
//   getInviteByEmail,
//   updateInvite,
//   markInviteAsRedeemed,
//   getRemainingInviteCount,
//   updateRemainingInvites,
//   getPeopleIReferredByEmail,
//   getPersonalInviteLinkForUserId,
//   getUserIdFromPersonalInviteCode,
// }
