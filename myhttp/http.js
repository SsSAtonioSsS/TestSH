const http = require('http');
const emts = require('events');

module.exports = class Http
{
    constructor(){
        this.emitter = new emts();
        this.server = this._create();
        this.middlewares = []
    }
    use(middleware){
        this.middlewares.push(middleware)
    }

    listen(port, callback)
    {
        return this.server.listen(port, callback)
    }

    addRoute(route){
        Object.keys(route.epoints).forEach(path => {
            const epoint = route.epoints[path];
            Object.keys(epoint).forEach((method) =>{
                
                this.emitter.on(this._webmask(path, method), (req, res) => {
                    const handler = epoint[method];
                    handler(req,res)
                })
            })
        })
    }
    _create(){
        return http.createServer((req, res) => {
            let body = "";
            this.middlewares.forEach(middleware => middleware(req,res));
            req.on('data', (chunk) => {
                body += chunk;
            })
            req.on('end', () => {
                if (body){
                    try {
                        req.body = JSON.parse(body);
                    } catch (err) {
                        return res.send({state: false, cause: 'JSONerr', dif: 'Please check your JSON request'})
                    }
                } else
                    req.body = JSON.parse('{}');

                const emt = this.emitter.emit(this._webmask(req.pathname || req.url, req.method), req, res)
                if (!emt)
                {
                    res.send({state: false, def: 'This route does not exists'})
                }
            })

        })
    }
    _webmask(path,method){
        return`${path}.${method}`
    }
}