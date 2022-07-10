/yel9vKkTsE0pZ9S3PmnzoIeD
    get: {} >> installDB

/users
    get:    {surname, name, patronymic, email, mobile} || {} >> GetUser
    post:   {name, surname, patronymic, email, mobile, birth}   >> CreateUser
    put:    {id, name, sname, pname, email, mobile, birth} || {id, ?} >> UpdateUser
    delete: {id}    >> DeleteUser

/store
    get: >> Info

/store/category
    get:    {name} || {} >> GetCategory
    post:   {name}  >> CreateCategory
    put:    {id, name} >> UpdateCategory
    delete: {id}    >> DeleteCategory

/store/item
    get:    {name, category, defen: {...}} || {}    >> GetItem
    post:   {category_id, name, cost, count, def} || {category_name, name, cost, count, def} >> CreateItem
    put:    {id, category_id, category_name, name, cost, count, defen} || {id, ?}   >> UpdateItem
    delete: {id}    >> DeleteItem

/store/move
    get:    {item_id} || {item_name}    >> GetMoved
    put:    {item_id, count} || {item_name, count} >> MoveItems

/basket
    get:    {client_id || mobile} >> GetBasket
    put:    {client_id || mobile, item_name || item_id, count} >> IntoBasket
    delete: {client_id || mobile, item_name || item_id, count} >> DeleteItemFromBasket

/orders
    get: {client_id} >> GetOrders

/order
    get:    {id} >> GetOrder
    put:    {client_id || mobile, order_date, basket} >> CreateOrder
    post:   {item_name || item_id, order_id, count} >> AddItemToOrder
    delete: {order_id} >> CancelOrder

/order/pay
    put:    {order_id, date_bill} >> PayOrder

/order/deliv
    post:   {order_id, delivery_date} >> DeliverOrder

JSON Request >> JSON Response
