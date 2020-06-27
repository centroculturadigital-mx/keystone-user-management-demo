var uuid = require("uuid");

const startPasswordRecovery = {
  schema: 'startPasswordRecovery(email: String!): ForgottenPasswordToken',
  resolver: async (obj, { email }, context) => {
    const token = uuid.v4();

    const tokenExpiration =
      parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRY) || 1000 * 60 * 60 * 24;

    const now = Date.now();
    const requestedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + tokenExpiration).toISOString();

    const { errors: userErrors, data: userData } = await context.executeGraphQL({
      context: context.createContext({ skipAccessControl: true }),
      query: `
        query findUserByEmail($email: String!) {
          allUsers(where: { email: $email }) {
            id
            email
          }
        }
      `,
      variables: { email: email },
    });

    if (userErrors || !userData.allUsers || !userData.allUsers.length) {
      console.error(
        userErrors,
        `Unable to find user when trying to create forgotten password token.`
      );
      return;
    }

    const userId = userData.allUsers[0].id;

    const result = {
      userId,
      token,
      requestedAt,
      expiresAt,
    };

    const { errors } = await context.executeGraphQL({
      context: context.createContext({ skipAccessControl: true }),
      query: `
        mutation createForgottenPasswordToken(
          $userId: ID!,
          $token: String,
          $requestedAt: DateTime,
          $expiresAt: DateTime,
        ) {
          createForgottenPasswordToken(data: {
            user: { connect: { id: $userId }},
            token: $token,
            requestedAt: $requestedAt,
            expiresAt: $expiresAt,
          }) {
            id
            token
            user {
              id
            }
            requestedAt
            expiresAt
          }
        }
      `,
      variables: result,
    });

    if (errors) {
      console.error(errors, `Unable to create forgotten password token.`);
      return;
    }

    return true;
  },
}

module.exports = startPasswordRecovery