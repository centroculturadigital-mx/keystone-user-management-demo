const { sendMail } = require('../mailer')

const afterForgottenPasswordTokenChange = async ({ context, updatedItem, existingItem }) => {
  if (existingItem) return null;

  const now = new Date().toISOString();

  const { errors, data } = await context.executeGraphQL({
    context: context.createContext({ skipAccessControl: true }),
    query: `
    query GetUserAndToken($user: ID!, $now: DateTime!) {
      User( where: { id: $user }) {
        id
        email
      }
      allForgottenPasswordTokens( where: { user: { id: $user }, expiresAt_gte: $now }) {
        token
        expiresAt
      }
    }
  `,
    variables: { user: updatedItem.user.toString(), now },
  });

  if (errors) {
    console.error(errors, `Unable to construct password updated email.`);
    return;
  }

  const { allForgottenPasswordTokens, User } = data;
  const forgotPasswordKey = allForgottenPasswordTokens[0].token;
  const url = process.env.SERVER_URL || 'http://localhost:3000';

  if (data) {
    const subject = 'You have request to restart your password'
    const text = `
      Recovery password token: ${forgotPasswordKey}
    `
    console.log('email', User.email)
    console.log('subject', subject)
    console.log('text', text)
    console.log('token', forgotPasswordKey)
    sendMail({
      emailTo: User.email,
      subject,
      text
    })
  }
}

module.exports = afterForgottenPasswordTokenChange