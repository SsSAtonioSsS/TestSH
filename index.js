const Http = require("./myhttp/http")

const Json = require("./myhttp/middlewares/json")
const Query = require("./myhttp/middlewares/url")
const route = require("./routes/route")


const PORT = process.env.PORT || 8081
const baseURL = process.env.baseURL || `http://localhost:${PORT}`

const http = new Http();
http.use(Json);
http.use(Query(baseURL));

http.addRoute(route);

http.listen(PORT, () => console.log(`Server started on ${PORT}`))