const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
    QUERY
} = require('../db')
const {
    SALT_ROUNDS,
    ACCESS_TOKEN_SECRET
} = process.env

router.post('/register', async (req, res) => {
    try {
        const {
            username,
            password,
            firstName,
            lastName
        } = req.body
        if (!username || !password || !firstName || !lastName) return res.status(401).json({
            err: true,
            msg: `[SERVER] fill all fields`
        })
        // Check if username already exists
        const select_q = `SELECT username FROM users WHERE username = ?`
        const data = await QUERY(select_q, username)
        if (data.length) return res.status(401).json({
            err: true,
            msg: `[SERVER] Username already taken`
        })

        bcrypt.hash(password, parseInt(SALT_ROUNDS), (err, hash) => {
            if (err) return res.status(401).json({
                err: true,
                msg: `[BCRYPT] hash problems: ` + err
            })
            const post_q = `INSERT INTO users(username, password, first_name, last_name) VALUES (?,?,?,?)`
            QUERY(post_q, username, hash, firstName, lastName)
            return res.json({
                err: false,
                msg: `[SERVER] ${username} registerd successfully`
            })
        });
    } catch (error) {
        return res.status(401).json({
            err: true,
            msg: `[SQL]: ` + error
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body
        if (!username || !password) return res.status(401).json({
            err: true,
            msg: `[SERVER] fill all fields`
        })
        const select_q = `SELECT * FROM users WHERE username = ?`
        const data = await QUERY(select_q, username)

        if (!data.length) return res.status(401).json({
            err: true,
            msg: `[SERVER] Incorrect Username & Password`
        })
        const match = await bcrypt.compare(password, data[0].password)
        if (!match) return res.status(401).json({
            err: true,
            msg: `[SERVER] Incorrect Username & Password`
        })
        const user = {
            ...data[0],
            password: '****'
        }
        const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
            expiresIn: '10m'
        })
        const post_q = `INSERT INTO access_tokens(token) VALUES(?)`
        QUERY(post_q, accessToken)
        res.json({
            err: false,
            accessToken: accessToken
        })
    } catch (error) {
        return res.status(401).json({
            err: true,
            msg: `[SQL]: ` + error
        })
    }
})
router.post('/logout', async (req, res)=>{
    try {
        const { token } = req.body
        const logout_q = `DELETE FROM access_tokens WHERE token = ?`
        await QUERY(logout_q, token)
        res.json({
            err: false,
            msg:`[SERVER] token removed`
        })
    } catch (error) {
        return res.status(401).json({
            err: true,
            msg: `[SQL]: ` + error
        })
    }
})

module.exports = router