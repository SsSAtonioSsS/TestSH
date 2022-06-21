module.exports = (baseURL) => (req,res) => {
    const purl = new URL(req.url, baseURL)
    const params = {}
    purl.searchParams.forEach((value, key) => params[key] = value)
    
    req.pathname = purl.pathname;
    req.params = params;
}