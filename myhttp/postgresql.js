const { Pool } = require('pg')

module.exports = class SQL
{
    constructor(user, host = 'localhost', db, password, port = 5432)
    {
        this.client = new Pool({user: user, host: host, database: db, password: password, port: port})
    }

    connect() {
        this.client.connect((er) => {
            throw new Error(er.stack)
        })
        
        process.on('exit', () => {
            this.client.end()
        })
    }
    
    async query(Query) {
        try {
            return await this.client.query(Query)
        } catch (er) {
            return new Error(er.stack)
        }
    }


    end() {
        this.client.end((er) =>{
            throw new Error(er.stack)
        })
    }
    
}