const post = require("../sql-controller")
const QueryFormat = require("../share/sqlformat")

class Users {
    async createUser(req, res) {
        const {name, surname, patronymic, email, mobile, birth} = req.body
        const Client = await post.query({text: 'insert into m_clients (sname, name, pname, email, mobile, birth) values ($1,$2,$3,$4,$5,$6) returning *;', values: [surname, name, patronymic, email, mobile, birth]})
        res.send(Client.rows[0])
    }
    
    async getUsers(req, res) {
        const Query = QueryFormat(req, ['sname', 'name', 'pname', 'email', 'mobile'])

        const Client = await post.query({text: 'select * from m_clients' + Query.sql, values: Query.value})
        res.send(Client.rows)
    }

    async updateUser(req, res) {
        const Query = QueryFormat(req, ['id', 'name', 'sname', 'pname', 'email', 'mobile', 'birth'], 0, ['id'])
        if (!Query.state) return res.send(Query)
        
        const Clients = await post.query({text: 'update m_clients set '+ Query.sql +' returning *;', values: Query.value})
        res.send(Clients.rows[0])
    }

    async deleteUser(req, res) {
        const {id} = req.body
        if (!id)
            return res.end('Unkown user id in query')
        const Client = await post.query({text: 'delete from m_clients where id = $1;', values: [id]})
        res.send(Client.rows[0])
    }
}

module.exports = new Users()