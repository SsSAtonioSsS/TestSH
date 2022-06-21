module.exports = class Route {
    constructor() {
        this.epoints = {}
    }
    _req(method = 'GET', path, handler)
    {
        if (!this.epoints[path])
        {
            this.epoints[path] = {}
        }

        const epoint = this.epoints[path];

        if (epoint[method])
        {
            throw new Error(`[${method}] по адресу ${path} уже существует`)
        }

        epoint[method] = handler
    }
    get(path, handler){
        this._req('GET', path, handler);
    }
    post(path, handler){
        this._req('POST', path, handler);
    }
    put(path, handler){
        this._req('PUT', path, handler);
    }
    delete(path, handler){
        this._req('DELETE', path, handler);
    }
    
}