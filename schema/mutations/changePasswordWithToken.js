const changePasswordWithToken = {
  schema: 'changePasswordWithToken(token: String!, password: String!): User',
  resolver: async (obj, { token, password }, context) => {
    const now = Date.now();

    const { errors, data } = await context.executeGraphQL({
      context: context.createContext({ skipAccessControl: true }),
      query: `
        query findUserFromToken($token: String!, $now: DateTime!) {
          passwordTokens: allForgottenPasswordTokens(where: { token: $token, expiresAt_gte: $now }) {
            id
            token
            user {
              id
            }
          }
        }`,
      variables: { token, now },
    });

    if (errors || !data.passwordTokens || !data.passwordTokens.length) {
      console.error(errors, `Unable to find token`);
      throw errors.message;
    }

    const user = data.passwordTokens[0].user.id;
    const tokenId = data.passwordTokens[0].id;

    const { errors: passwordError } = await context.executeGraphQL({
      context: context.createContext({ skipAccessControl: true }),
      query: `mutation UpdateUserPassword($user: ID!, $password: String!) {
        updateUser(id: $user, data: { password: $password }) {
          id
        }
      }`,
      variables: { user, password },
    });

    if (passwordError) {
      console.error(passwordError, `Unable to change password`);
      throw passwordError.message;
    }

    await context.executeGraphQL({
      context: context.createContext({ skipAccessControl: true }),
      query: `mutation DeletePasswordToken($tokenId: ID!) {
        deleteForgottenPasswordToken(id: $tokenId) {
          id
        }
      }
    `,
      variables: { tokenId },
    });

    return true;
  },
}

module.exports = changePasswordWithToken