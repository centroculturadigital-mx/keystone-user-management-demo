const { Text, Checkbox, Password } = require('@keystonejs/fields');

const  { userIsAdmin, userIsAdminOrOwner } = require('../access')

const {
  validateUserInput,
  afterUserChange
} = require('../hooks')

const User = {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isEmailValidated: {
      type: Checkbox,
      default: false,
      access: {
        update: userIsAdmin,
      },
    },
    isAdmin: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: userIsAdmin,
      },
    },
    password: {
      type: Password,
    },
  },
  hooks: {
    validateInput: async (options) => await validateUserInput(options),
    afterChange: async (options) => await afterUserChange(options)
  },
  adminConfig: {
    defaultColumns: 'email, isEmailValidated'
  },
  // List-level access controls
  access: {
    read: true,
    update: userIsAdminOrOwner,
    create: userIsAdmin,
    delete: userIsAdmin,
    auth: true,
  },
}

module.exports = User