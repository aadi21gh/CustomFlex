const crypto = require('crypto');

const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

console.log('\n======================================================');
console.log('🔒 CUSTOMFLEX PRODUCTION SECURITY KEY GENERATOR 🔒');
console.log('======================================================');
console.log(`Generated Secure JWT_SECRET:`);
console.log(`👉  ${generateJWTSecret()}  👈`);
console.log('======================================================\n');
