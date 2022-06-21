const SQL = require("../myhttp/postgresql");
const config = require("./sql-settings")

const post = new SQL(config.User, config.Host, config.DataBase, config.Password, config.Port)

module.exports = post