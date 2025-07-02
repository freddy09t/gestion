const bcrypt = require('bcrypt');
const password = "0913040730";

bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
  process.exit(); // Para que termine el script
});
