const validateUserWithToken = {
  schema: 'validateUserWithToken(token: String!): User',
  resolver: async (obj, { token }, context) => {
    const now = Date.now();

    const { errors, data } = await context.executeGraphQL({
      context: context.createContext({ skipAccessControl: true }),
      query: `
        query findUserFromToken($token: String!, $now: DateTime!) {
          UserValidationToken: allUserValidationTokens(where: { token: $token, expiresAt_gte: $now }) {
            id
            token
            user {
              id
            }
          }
        }`,
      variables: { token, now },
    });

    if (errors || !data.UserValidationToken || !data.UserValidationToken.length) {
      console.error(errors, `Unable to find token`);
      throw errors.message;
    }

    const user = data.UserValidationToken[0].user.id;
    const tokenId = data.UserValidationToken[0].id;

    const { errors: activationError } = await context.executeGraphQL({
      context: context.createContext({ skipAccessControl: true }),
      query: `mutation ActivateUser($user: ID!) {
        updateUser(id: $user, data: { isEmailValidated: true }) {
          id
          name
          email
          isEmailValidated
        }
      }`,
      variables: { user },
    });

    if (activationError) {
      console.error(activationError, `Unable to activate user`);
      throw activationError.message;
    }

    await context.executeGraphQL({
      context: context.createContext({ skipAccessControl: true }),
      query: `mutation DeleteActivationToken($tokenId: ID!) {
        deleteUserValidationToken(id: $tokenId) {
          id
        }
      }
    `,
      variables: { tokenId },
    });

    return true;
  },
}

module.exports = validateUserWithToken