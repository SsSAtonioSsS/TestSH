module.exports = (req, res) => {
    req = (data) =>
    {
        req.body = JSON.parse(data)
    }
}