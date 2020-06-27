const validateUserInput = ({
  operation,
  resolvedData,
  addValidationError
}) => {
  if (operation == 'create' && resolvedData.isEmailValidated){
    console.log('no puedes crear')
    addValidationError('cant create validated user')
  }
  return resolvedData
}

module.exports = validateUserInput