module.exports = (req, ar, valQ = 0, arupd) => {
        let val = 0
        const value = []
        let Query = {query:'', where: ''}
        Object.keys(req.body).forEach((v,k) => {
            if (ar.includes(v)) {
                if (arupd) {
                    if (arupd.includes(v)){
                        Query.where += (val++ >0 ? ' and ' : ' where ')+`${v} = $${++valQ}`
                        value.push(req.body[v])
                        return
                    }
                    Query.query += (valQ - val > 0 ? ', ' : '') + `${v} = $${++valQ}`
                } else {
                    Query.query += (valQ > 0 ? ' and ' : ' where ') + `${v} = $${++valQ}`
                }
                value.push(req.body[v])
            }
        });
        if (arupd && Query.where === '')
            return {state: false, cause: 'idupdate', def: 'No id numbers'}

        Query = Query.query + Query.where
        return {state: true, sql: Query, value: value, count: valQ}
}