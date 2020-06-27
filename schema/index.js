const startPasswordRecovery = require('./mutations/startPasswordRecovery')
const changePasswordWithToken = require('./mutations/changePasswordWithToken')
const validateUserWithToken = require('./mutations/validateUserWithToken')

const CustomSchema = {
  mutations: [
    startPasswordRecovery,
    changePasswordWithToken,
    validateUserWithToken
  ],
}

module.exports = { CustomSchema };