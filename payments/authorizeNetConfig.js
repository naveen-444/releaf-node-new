// authorizeNetConfig.js
const sdk = require('authorizenet');
const { APIContracts } = sdk;

const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
merchantAuthenticationType.setName('6RxM62v2M9');
merchantAuthenticationType.setTransactionKey('3BA6nCx7W78m29hf');

module.exports = merchantAuthenticationType;