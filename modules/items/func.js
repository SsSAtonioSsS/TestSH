const post = require("../sql-controller")
const QueryFormat = require("../share/sqlformat")

class Store {
    // Categories
    async createCategory(req, res) {
        const {name} = req.body  
        const Category = await post.query({text: 'insert into m_item_categories (name) values ($1) returning *;', values: [name]})
        res.send(Category.rows[0])
    }

    async getCategory(req, res) {
        const Query = QueryFormat(req, ['name'])

        const Category = await post.query({text: 'select * from m_item_categories'+ Query.sql, values: Query.value})
        res.send(Category.rows)
    }

    async updateCategory(req, res) {
        const Query = QueryFormat(req, ['id', 'name'], 0, ['id'])
        if (!Query.state) return res.send(Query)
        
        const Category = await post.query({text: 'update m_item_categories set '+Query.sql+' returning *;', values: Query.value})
        res.send(Category.rows[0])
    }

    async deleteCategory(req, res) {
        const {id} = req.body

        if (!id)
            return res.end({state: false, cause:'UknID', def: 'Unkown category id in query'})

        const Category = post.query({text: 'delete from m_item_categories where id = $1', values: [id]})
        res.send(Category.rows)
    }
    //

    // Items
    async createItem(req, res) { 
        const {category_id, category_name, name, cost, count, def} = req.body
        const Item = await post.query({text: 'insert into m_item_names (id_cat, name, cost, count, defen) values ('+(category_id ? '$1':'(select id from m_item_categories where name = $1 fetch first row only)')+', $2, $3, $4, $5) returning *;', values: [(category_id?category_id:category_name), name, cost, count, def]})
        res.send(Item.rows)
    }

    async getItem(req, res) {

        const {name, category, defen} = req.body
        
        const value = []
        for(let v of [name, category]) {
            if (v) value.push(v)
        }

        let q2 = ''

        if (defen) {
            Object.keys(defen).forEach((v, k) => q2 += (k!=0?' and ':'')+'defen->>\''+v+'\'=\''+defen[v]+'\'')
        }

        let i = 0
        const q1 = (name ? 'a.name = $'+ (++i) : '') + (category ? (i!=0?' and ':'') + 'b.name = $'+ (++i) : '') + (q2?(i!=0?' and ':'')+q2:'')
        const Item = await post.query({text: 'select a.*, b.name as category from m_item_names a join m_item_categories b on a.id_cat = b.id'+ (i!=0?' where '+q1:';'), values: value})
        res.send(Item.rows)
    }

    async updateItem(req, res) {
        
        const {id, category_id, category_name, name, cost, count, defen} = req.body
        
        const value = []
        for(let v of [category_id || category_name, name, cost, count, defen, id]) {
            if (v) value.push(v)
        }
        if (value.length < 2)
            return res.send(res.send({state: false, cause: 'nothing', def: 'No items to change'}))

        let i = 0

        const q1 = (category_id? 'id_cat = $'+ (++i): (category_name? '(select id from m_item_categories where name = $'+ (++i) +' fetch first row only)' : '')) + (name? ((i!=0?', ':'')+'name = $'+ (++i)): '') + (cost? ((i!=0?', ':'')+'cost = $'+ (++i)): '') + (count? ((i!=0?', ':'')+'count = $'+ (++i)): '') + (defen? ((i!=0?', ':'')+'defen = $'+ (++i)): '')
        const Item = await post.query({text: 'update m_item_names set '+ q1 +' where id = $'+(++i)+' returning *;', values: value})
        res.send(Item.rows[0])
    }

    async deleteItem(req, res) {
        const {id} = req.body
        if (!id)
            return res.send({state: false, cause:'UknID', def:'Unkown item id in query'})

        const Item = post.query({text: 'delete from m_item_names where id = $1;', values: [id]})
        res.send(Item.rows)
    }
    //

    // Store
    async moveItems(req, res) {
        const {item_id, item_name, count} = req.body
        let Items = await post.query({text:'select count from m_item_names where '+(item_id ? 'id':'name')+' = $1;', values: [(item_id ? item_id : item_name)]})
        
        try{
            Items = Items.rows[0].count
        } catch (err) {
            return res.send({state: false, cause: 'NotInteger', def: 'ID isnt name!'})
        }

        if (count < 0 && Math.abs(count) > Items)
            return res.send({state: false, cause: 'lessObj', def: 'There is less than the entered value in the object store.'})
        
        await post.query({text:'insert into m_item_move (id_item, offs) values ('+(item_id ? '$1':'(select id from m_item_names where name = $1 fetch first row only)')+', $2);', values: [(item_id?item_id:item_name), count]})

        Items = await post.query({text: 'update m_item_names set count = $1 where '+(item_id?'id':'name')+' = $2 returning *;', values: [(Items+parseInt(count)), (item_id ? item_id : item_name)]})
        res.send(Items.rows[0])
    }

    async getMoved(req, res) {
        const {item_id, item_name} = req.body
        
        const getMv = await post.query({text:'select a.*, b.name from m_item_move a join m_item_names b on a.id_item = b.id'+ ((item_id || item_name)?' where '+(item_id?'a.id_item':'b.name')+' = $1':';'), values: (item_id || item_name ?[(item_id?item_id:item_name)]: [])})
    
        res.send(getMv.rows)
    }
    //
}

module.exports = new Store ()