const colors = require('colors');
module.exports = (client) => {
    console.log(colors.green(`✅ | Logged in as ${client.user.tag}!`));
}