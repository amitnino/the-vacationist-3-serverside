const jwt = require('jsonwebtoken')
const {
    QUERY
} = require('./db')
const {
    ACCESS_TOKEN_SECRET
} = process.env

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization']
        if (!token) return res.status(401).json({
            err: true,
            type:'token',
            msg: `[SERVER] No token delievered`
        })
        const select_q = `SELECT * FROM access_tokens WHERE token = ?`
        const data = await QUERY(select_q, token)
        if (!data.length) return res.status(401).json({
            err: true,
            type: 'token',
            msg: `[SERVER] token invalid `
        })
        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                const drop_q = `DELETE FROM access_tokens WHERE id = ?`
                QUERY(drop_q, data[0].id)
                return res.status(401).json({
                    err: true,
                    type: 'token',
                    msg: `[SERVER] token expired `
                })
            }
            req.user = decoded
            next()
        })
    } catch (error) {
        return res.status(401).json({
            err: true,
            type: 'token',
            msg: `[SERVER] `+error
        })
    }
}

const verifyAuth = (req, res, next)=>{
    if (req.user.role !== 'admin') return res.status(500).json({
        err: true,
        type: 'auth',
        msg: `[SERVER] ${req.user.first_name} is unauthorized!`
    })
    next()
}

module.exports = {
    verifyToken,
    verifyAuth
}