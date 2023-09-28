import axios from 'axios'

export const sendMessage = async (channel, variables) => {
  const slackId = process.env.SLACK_ID!
  // TODO: pass channel in, instead of hard coding here
  return await axios({
    url: `https://hooks.slack.com/services/${slackId}/${channel}`,
    method: 'POST',
    data: {
      ...variables,
    },
  })
}

export const sendInteractionResponse = async (url, variables) => {
  // TODO: pass channel in, instead of hard coding here
  return await axios({
    url: `${url}`,
    method: 'POST',
    data: {
      ...variables,
    },
  })
}

export default { sendMessage, sendInteractionResponse }
