var uuid = require("uuid");

const { sendMail } = require('../mailer')

const afterUserChange = async ({
  operation,
  resolvedData,
  updatedItem,
  context
}) => {
  if (operation == 'create') {

    const userId = updatedItem.id
    const token = uuid.v4();
    const tokenExpiration =
      parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRY) || 1000 * 60 * 60 * 24;
    const now = Date.now();
    const requestedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + tokenExpiration).toISOString();


    const {data, errors} = await context.executeGraphQL({
      query: `mutation createValidationToken($data: UserValidationTokenCreateInput) {
        createUserValidationToken(data: $data) {
          id
          token
        }
      }`,
      variables: { 
        data: {
          user: { connect: { id: userId } },
          token,
          requestedAt,
          expiresAt
        }
       },
      context: context.createContext({ skipAccessControl: true })
    })

    if (data) {
      const subject = 'Validate your accout'
      const text = `
        Your user validation token: ${data.createUserValidationToken.token}
      `
      console.log('email', updatedItem.email)
      console.log('subject', subject)
      console.log('text', text)
      console.log('token', data.createUserValidationToken.token)
      sendMail({
        emailTo: updatedItem.email,
        subject,
        text
      })
    }
  }
}

module.exports = afterUserChange