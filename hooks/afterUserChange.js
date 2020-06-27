var uuid = require("uuid");


const afterUserChange = async ({
  operation,
  resolvedData,
  updatedItem,
  context
}) => {
  if (operation == 'create') {

    console.log('updatedItem', updatedItem)

    const userId = updatedItem.id || 'idddd'

    const token = uuid.v4();
    const tokenExpiration =
      parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRY) || 1000 * 60 * 60 * 24;
    const now = Date.now();
    const requestedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + tokenExpiration).toISOString();


    const res = await context.executeGraphQL({
      query: `mutation createValidationToken($data: UserValidationTokenCreateInput) {
        createUserValidationToken(data: $data) {
          id
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

    console.log(res)
  }
}

module.exports = afterUserChange