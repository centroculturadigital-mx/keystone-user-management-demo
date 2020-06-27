const { Text, Relationship, DateTime } = require('@keystonejs/fields');

const  { userIsAdmin } = require('../access')

const { afterForgottenPasswordTokenChange } = require('../hooks')

const ForgottenPasswordToken = {
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
  access: {
    create: true,
    read: true,
    update: userIsAdmin,
    delete: userIsAdmin,
  },
  hooks: {
    afterChange: async (options) => afterForgottenPasswordTokenChange(options)
  }
};

module.exports = ForgottenPasswordToken