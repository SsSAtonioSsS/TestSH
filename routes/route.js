const Route = require("../myhttp/route")
const client = require("../modules/clients/func")
const store = require("../modules/items/func")
const order = require("../modules/orders/func")
const install = require("../modules/install/install")

const route = new Route()

route.get('/users', (req, res) => client.getUsers(req, res))
route.post('/users', (req, res) => client.createUser(req, res))
route.put('/users', (req, res) => client.updateUser(req, res))
route.delete('/users', (req, res) => client.deleteUser(req, res))


route.get('/store', (req, res) => res.end('Available Paths ./category || ./item || ./move'))
route.get('/yel9vKkTsE0pZ9S3PmnzoIeD', (req, res) => install(req, res))

route.get('/store/category', (req, res) => store.getCategory(req, res))
route.post('/store/category', (req, res) => store.createCategory(req, res))
route.put('/store/category', (req, res) => store.updateCategory(req, res))
route.delete('/store/category', (req, res) => store.deleteCategory(req, res))

route.get('/store/item', (req, res) => store.getItem(req, res))
route.post('/store/item', (req, res) => store.createItem(req, res))
route.put('/store/item', (req, res) => store.updateItem(req, res))
route.delete('/store/item', (req, res) => store.deleteItem(req, res))

route.get('/store/move', (req, res) => store.getMoved(req, res))
route.put('/store/move', (req, res) => store.moveItems(req, res))

route.get('/basket', (req, res) => order.getBasket(req, res))
route.put('/basket', (req, res) => order.toBasket(req, res))
route.delete('/basket', (req, res) => order.deleteBasketItem(req, res))

route.get('/orders', (req, res) => order.getOrders(req, res))

route.get('/order', (req, res) => order.getOrder(req, res))
route.put('/order', (req, res) => order.createOrder(req, res))
route.post('/order', (req, res) => order.addItemToOrder(req, res))
route.delete('/order', (req, res) => order.cancelOrder(req, res))

route.put('/order/pay', (req, res) => order.PayOrder(req, res))
route.post('/order/deliv', (req, res) => order.DeliverOrder(req, res))

module.exports = route