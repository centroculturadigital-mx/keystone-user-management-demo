const { Text, Relationship, DateTime } = require('@keystonejs/fields');

const  { userIsAdmin } = require('../access')

const UserValidationToken = {
  access: {
    create: true,
    read: true,
    update: userIsAdmin,
    delete: userIsAdmin,
  },
  fields: {
    user: {
      type: Relationship,
      ref: 'User',
      access: {
        read: userIsAdmin,
      },
    },
    token: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: {
        read: userIsAdmin,
      },
    },
    requestedAt: { type: DateTime, isRequired: true },
    accessedAt: { type: DateTime },
    expiresAt: { type: DateTime, isRequired: true },
  },
  hooks: {
    afterChange: async ({ context, updatedItem, existingItem }) => {
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
          allUserValidationTokens( where: { user: { id: $user }, expiresAt_gte: $now }) {
            token
            expiresAt
          }
        }
      `,
        variables: { user: updatedItem.user.toString(), now },
      });

      if (errors) {
        console.error(errors, `Unable to.....`);
        return;
      }

      const { allUserValidationTokens, User } = data;
      const userActivationKey = allUserValidationTokens[0].token;
      const url = process.env.SERVER_URL || 'http://localhost:3000';

      // const props = {
      //   userActivationUrl: `${url}/activate-user?key=${userActivationKey}`,
      //   recipientEmail: User.email,
      // };

      // const options = {
      //   subject: 'Request for password reset',
      //   to: User.email,
      //   from: process.env.MAILGUN_FROM,
      //   domain: process.env.MAILGUN_DOMAIN,
      //   apiKey: process.env.MAILGUN_API_KEY,
      // };

      console.log('sendingEmail activacion', userActivationKey)
      // await sendEmail('forgot-password.jsx', props, options);
    },
  },
};

module.exports = UserValidationToken