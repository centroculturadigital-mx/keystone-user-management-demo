const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');


const initialiseData = require('./initial-data');

const {
  User,
  ForgottenPasswordToken,
  UserValidationToken
} = require('./lists')

const { CustomSchema } = require('./schema')

const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');

const PROJECT_NAME = 'user-auth-ctrl';
const adapterConfig = { mongoUri: 'mongodb://localhost/user-auth-ctrl' };

const keystone = new Keystone({
  cookieSecret: 'asdghjqweyuizxcnnm',
  name: PROJECT_NAME,
  adapter: new Adapter(adapterConfig),
  onConnect: process.env.CREATE_TABLES !== 'true' && initialiseData,
});

keystone.createList('User', User)
keystone.createList('ForgottenPasswordToken', ForgottenPasswordToken)
keystone.createList('UserValidationToken', UserValidationToken)

keystone.extendGraphQLSchema(CustomSchema)

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      enableDefaultRoute: true,
      authStrategy,
    }),
  ],
};
