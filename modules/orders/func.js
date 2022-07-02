const post = require("../sql-controller")

class Orders {
    
    //  GetClient & GetItem
        async _getClientID(req)
        {
            const {client_id, mobile} = req.body
            let Client = await post.query({text: 'select id from m_clients where '+(client_id?'id':'mobile')+' = $1;', values: [(client_id?client_id:mobile)]})
                try {
                    Client = Client.rows[0]
                    if (!Client)
                        return {state: false, cause: 'clnot', def: 'Client not found'}
                } catch (err) {
                    return {state: false, cause: 'isntint', def: 'Isnot int value'}
                }
            return {state: true, id: Client.id}
        }
        async _getItemID(req)
        {
            const {item_name, item_id} = req.body
            let Item = await post.query({text: 'select id from m_item_names where '+ (item_id?'id':'name')+' = $1;', values: [(item_id?item_id:item_name)]})
            try {
                Item = Item.rows[0]
                if (!Item)
                    return {state: false, cause: 'itmnot', def: 'Item not found'}
            } catch (err) {
                return {state: false, cause: 'isntint', def: 'Isnot int value'}
            }
            return {state: true, id: Item.id}
        }

        _getMoney(string)
        {
            return parseFloat(string.replace('$','').replace(',',''))
        }
    //

    // Basket Logic
        async toBasket(req, res)
        {
                const {count} = req.body

                const Client = await this._getClientID(req, res)
                if (!Client.state) return res.send(Client)
                const Item = await this._getItemID(req, res)
                if (!Item.state) return res.send(Item)

                if (!count || count <=0)
                    return res.send({state: false, cause: 'lowcount', def: 'Count can not be less then 1'})

                let Basket = await post.query({text: 'select count from m_basket where id_client = $1 and id_item = $2', values: [Client.id, Item.id]})
                Basket = Basket.rows[0]
                
                if (!Basket)
                    Basket = await post.query({text: 'insert into m_basket (id_client, id_item, count) values ($1, $2, $3) returning *', values: [Client.id, Item.id, count]})
                else
                    Basket = await post.query({text: 'update m_basket set count = $1 where id_client = $2 and id_item = $3 returning *', values: [count, Client.id, Item.id]})
                
                return res.send(Basket.rows)
        }

        async getBasket(req, res)
        {
            const Client = await this._getClientID(req, res)
            if (!Client.state) return res.send(Client)

            const Basket = await post.query({text: 'select a.*, b.name from m_basket a join m_item_names b on a.id_item = b.id where id_client = $1', values:[Client.id]})
            
            return res.send(Basket.rows)
        }

        async deleteBasketItem(req, res)
        {
            const {count} = req.body

                const Client = await this._getClientID(req, res)
                if (!Client.state) return res.send(Client)
                const Item = await this._getItemID(req, res)
                if (!Item.state) return res.send(Item)

                if (!count || count <=0)
                return res.send({state: false, cause: 'lowcount', def: 'Count can not be less then 1'})

            let Basket = await post.query({text: 'select count from m_basket where id_client = $1 and id_item = $2', values: [Client.id, Item.id]})
            Basket = Basket.rows[0]

            if (!Basket)
                    return res.send({state: false, cause: 'nothisitem', def: 'This Client do not has this items in basket'})
                else
                    if (Basket.count <= count)
                        Basket = await post.query({text: 'delete from m_basket where id_client = $1 and id_item = $2;', values: [Client.id, Item.id]})
                    else
                        Basket = await post.query({text: 'update m_basket set count = $1 where id_client = $2 and id_item = $3 returning *', values: [(Basket.count - parseInt(count)), Client.id, Item.id]})
                
                return res.send(Basket.rows)
        }
    //

    // Orders
        async createOrder(req, res)
        {
            const {order_date, basket} = req.body
            if (!order_date)
            return res.send({state: false, cause:'nodate', def: 'Order date does not found in body'})
            
            const Client = await this._getClientID(req, res)
            if (!Client.state) return res.send(Client)
            
            let Order = await post.query({text:'insert into m_order(id_client, order_date) values ($1, '+(order_date ? '$2' : 'now()::date')+') returning *;', values: (order_date?[Client.id, order_date] : [Client.id])})
            
            if (basket)
                await this._copyFromBasket(1, Client.id)
            
            return res.send(Order.rows)
        }
    
        async _copyFromBasket(orderid, clientid)
        {
            let Itms = await post.query({text: 'select id_item, count from m_basket where id_client = $1 order by id_item asc', values: [clientid]})
            Itms = Itms.rows
            
            let nums = []
            Itms.forEach(k => {nums.push(k.id_item)});

            let onitems = await post.query({text: 'select id, count from m_item_names where id in ('+nums+') order by id asc'})    
            nums = null;
            onitems = onitems.rows

            Itms.forEach((V, K) => {
                if (V.count <= onitems[K].count) {
                    post.query({text: 'insert into m_order_details(id_order, id_item, count) values($1, $2, $3);', values: [orderid, V.id_item, V.count]})
                    post.query({text: 'delete from m_basket where id_client = $1 and id_item = $2;', values:[clientid, V.id_item]})
                } else {
                    post.query({text: 'insert into m_order_details(id_order, id_item, count) values($1, $2, $3);', values: [orderid, V.id_item, onitems[K].count]})
                    post.query({text: 'update m_basket set count = $1 where id_client = $2 and id_item = $3;', values: [(V.count - onitems[K].count), clientid, V.id_item]})
                }
            })

            return {state: true, def: 'Copied if available'}
        }

        async getOrders(req, res) {
            const {client_id} = req.body
            const Orders = await post.query({text: 'select * from m_order where id_client = $1', values: [client_id]})
            return res.send(Orders.rows)
        }
        async getOrder(req, res)
        {
            const {id} = req.body
            if (!id)
                return res.send({state: false, cause:'noid', def: 'Id does not exist in body'})
            let Order = await post.query({text: 'select a.id, a.order_date, a.delivery_date, b.name, b.sname, b.mobile from m_order a join m_clients b on a.id_client = b.id where a.id = $1;', values: [id]})
            
            if (!Order.rows[0])
                return res.send({state: false, cause: 'notf', def: 'Order not found'})

            const Items = await post.query({text: 'select a.id_item, a.count, b.name, b.cost from m_order_details a join m_item_names b on a.id_item = b.id where a.id_order = $1;', values: [id]})
            Order.rows[0].summary = 0
            Items.rows.forEach((V) =>{
                Order.rows[0].summary += V.count*this._getMoney(V.cost)
            })

            const Pay = await post.query({text: 'select id, date_bill, sum from m_paybill where id_order = $1;', values: [id]})
            if (!Pay.rows[0])
            Order = Order.rows.concat({state: false, def: 'Not Payed yet'})
            else
            Order = Order.rows.concat(Pay.rows)

            return res.send(Order.concat([Items.rows]))
        }

        async addItemToOrder(req, res)
        {
            const {order_id, count} = req.body
            if (!order_id)
                return res.send({state: false, cause: 'orderid', def: 'No order id in body'})
            if (!count)
                return res.send({state: false, cause: 'nocnt', def: 'Count not found in body'})

            const Item = await this._getItemID(req, res)
            if (!Item.state) return res.send(Item)

            let Items = await post.query({text:'select count from m_order_details where id_order = $1 and id_item = $2;', values: [order_id, Item.id]})
            
            if (Items.rows[0]) {
                if (count < 0 && Math.abs(count) >= Items.rows[0].count) {
                    post.query({text:'delete from m_order_details where id_order = $1 and id_item = $2;', values: [order_id, Item.id]})
                    return res.send({state: true, def: 'Deleted'})
                } else {
                    post.query({text:'update m_order_details set count = $1 where id_order = $2 and id_item = $3;', values: [(Items.rows[0].count + count), order_id, Item.id]})
                    return res.send({state: true, def: 'Updated'})
                }
            } else {
                if (count < 0)
                    return res.send({state: false, cause: 'negint', def: 'This item does not exists, do not write negative integers'})
                post.query({text:'insert into m_order_details(id_order, id_item, count) values ($1, $2, $3);', values: [order_id, Item.id, count]})
                return res.send({state: true, def: 'Added'})
            }
        }
        
        async cancelOrder(req, res)
        {
            const {order_id} = req.body
            if (!order_id)
                return res.send({state: false, cause: 'orderid', def: 'No order id in body'})

            let Pay = await post.query({text: 'select id, date_bill, sum from m_paybill where id_order = $1;', values: [order_id]})
            Pay = !Pay.rows[0]? false : true 

            if (Pay) {
                let Items = await post.query({text: 'select id_item, count from m_order_details where id_order = $1 order by id_item asc', values: [order_id]})
                Items = Items.rows
                
                Items.forEach(k => {
                    post.query({text: 'insert into m_item_move(id_item, offs) values($1, $2);', values: [k.id_item, k.count]})
                    post.query({text: 'update m_item_names set count = count + $1 where id = $2;', values: [k.count, k.id_item]})
                })
            }

            const Canceled = await post.query({text:'update m_order set canceled = true where id = $1 returning *;', values: [order_id]})
            return res.send(Canceled.rows[0])
        }

        async PayOrder(req, res)
        {
            const {order_id, date_bill} = req.body
            if (!order_id)
                return res.send({state: false, cause: 'orderid', def: 'No order id in body'})
            
            const Cancel = await post.query({text: 'select canceled from m_order where id = $1', values: [order_id]})
            if (!Cancel.rows[0])
                return res.send({state: false, cause: 'notf', def: 'Order not found'})
            if (Cancel.rows[0].canceled)
                return res.send({state: false, cause: 'canceled', def: 'Order was canceled'})

            let Sum = 0
            
            let Items = await post.query({text: 'select a.count, b.cost from m_order_details a join m_item_names b on a.id_item = b.id where a.id_order = $1;', values: [order_id]})
            Items.rows.forEach((V) =>{
                Sum += V.count*this._getMoney(V.cost)
            })
            Items = null
        
            const Bill = await post.query({text: 'insert into m_paybill(id_order, sum, date_bill) values ($1, $2, '+(date_bill?'$3':'now()::date')+') returning *;', values: (date_bill?[order_id, Sum, date_bill]:[order_id, Sum])})
            
            Items = await post.query({text: 'select id_item, count from m_order_details where id_order = $1 order by id_item asc;', values: [order_id]})
            Items = Items.rows
            
            Items.forEach(k => {
                post.query({text: 'insert into m_item_move(id_item, offs) values($1, $2);', values: [k.id_item, -k.count]})
                post.query({text: 'update m_item_names set count = count - $1 where id = $2;', values: [k.count, k.id_item]})
            });
         
            return res.send(Bill.rows[0])
        }

        async DeliverOrder(req, res)
        {
            const {order_id, delivery_date} = req.body
            if (!order_id)
                return res.send({state: false, cause: 'orderid', def: 'No order id in body'})
            
            const Cancel = await post.query({text: 'select canceled from m_order where id = $1', values: [order_id]})
            if (!Cancel.rows[0])
                return res.send({state: false, cause: 'notf', def: 'Order not found'})
            if (Cancel.rows[0].canceled)
                return res.send({state: false, cause: 'canceled', def: 'Order was canceled'})

            const Delivered = await post.query({text: 'update m_order set delivery_date = '+ (delivery_date?'$2':'now()') +' where id = $1 returning *;', values: (delivery_date?[order_id, delivery_date]:[order_id])})
            return res.send(Delivered.rows[0])
        }
    //

}

module.exports = new Orders()