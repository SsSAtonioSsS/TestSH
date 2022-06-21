const post = require("../sql-controller")

class Users {
    async createUser(req, res) {  
        const {name, surname, patronymic, email, mobile, birth} = req.body
        const Client = await post.query({text: 'insert into m_clients (sname, name, pname, email, mobile, birth) values ($1,$2,$3,$4,$5,$6) returning *;', values: [surname, name, patronymic, email, mobile, birth]})
        res.send(Client.rows[0])
    }
    
    async getUsers(req, res) {
        const {surname, name, patronymic, email, mobile} = req.body
        
        const value = []
        for(let v of [surname, name, patronymic, email, mobile]) {
            if (v) value.push(v)
        }
        let i = 0

                const q1 = (surname ? 'sname = $'+ (++i) :'') + (name ? (i!=0?' and ':'')+'name = $'+ (++i) : '') + (patronymic ? (i!=0?' and ':'')+'pname = $'+ (++i) : '') + (email ? (i!=0?' and ':'')+'email = $'+ (++i) : '') + (mobile ? (i!=0?' and ':'')+'mobile = $'+ (++i) : '')
        const Client = await post.query({text: 'select * from m_clients'+ (i != 0 ? ' where '+q1:'') + ';', values: value})
        res.send(Client.rows)
    }

    async updateUser(req, res) {
        const {id, name, sname, pname, email, mobile, birth} = req.body

        const value = []
        for(let v of [name, sname, pname, email, mobile, birth, id]) {
            if (v) value.push(v)
        }

        if (value.length < 2)
            return res.send(res.send({state: false, cause: 'nothing', def: 'No items to change'}))

        let i = 0
        
        const q1 = (name?'name=$'+(++i):'') + (sname?((i!=0?', ':'')+'sname=$'+(++i)):'') + (pname?((i!=0?', ':'')+'pname=$'+(++i)):'') + (email?((i!=0?', ':'')+'email=$'+(++i)):'') + (mobile?((i!=0?', ':'')+'mobile=$'+(++i)):'')+ (birth?((i!=0?', ':'')+'birth=$'+(++i)):'')
        const Clients = await post.query({text: 'update m_clients set '+q1+' where id = $'+(++i)+' returning *;', values: value})
        res.end(Clients.rows[0])
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