const router = require('express').Router()
const {
    verifyToken,
    verifyAuth
} = require('../Verification')
const {
    QUERY
} = require('../db')
const {
    SELECT_QUERY
} = process.env

// ALL VERIFIED USERS ACCESS

router.use(verifyToken)

router.get('/search/:word', async (req, res) => {
    try {
        const word = '%' + req.params.word + '%'
        if (!word) return res.status(504).json({
            err: true,
            type: 'server',
            msg: '[SERVER] no search word'
        })
        const search_q = `SELECT * FROM vacations WHERE title LIKE ?`
        const data = await QUERY(search_q, word)
        res.json({
            err: false,
            msg: '[SERVER] search succesful!',
            vacations: data
        })
    } catch (error) {
        return res.status(504).json({
            err: true,
            type: 'server',
            msg: error
        })
    }
})

router.get('/likes/add/:id', async (req, res) => {
    try {
        const vacationID = req.params.id
        const userID = req.user.id
        const post_q = `INSERT INTO vac_likes(user_id, vac_id) VALUES(?,?)`
        await QUERY(post_q, userID, vacationID)
        const data = await QUERY(SELECT_QUERY, req.user.id, req.user.id)
        return res.json({
            err: false,
            vacations: data
        })
    } catch (error) {
        return res.status(504).json({
            err: true,
            type: 'server',
            msg: error
        })
    }
})
router.get('/likes/remove/:id', async (req, res) => {
    try {
        const vacationID = req.params.id
        const userID = req.user.id
        const delete_q = `DELETE FROM vac_likes WHERE user_id = ? AND vac_id = ?`
        await QUERY(delete_q, userID, vacationID)
        const data = await QUERY(SELECT_QUERY, req.user.id, req.user.id)
        return res.json({
            err: false,
            vacations: data
        })

    } catch (error) {
        return res.status(504).json({
            err: true,
            type: 'server',
            msg: error
        })
    }
})
router.get('/likes', async (req, res) => {
    try {
        const id = req.user.id
        const select_q = `SELECT * FROM vac_likes WHERE user_id = ? `
        const data = await QUERY(select_q, id)
        res.json({
            err: false,
            likes: data
        })
    } catch (error) {
        return res.status(504).json({
            err: true,
            type: 'server',
            msg: error
        })
    }
})
router.get('/', async (req, res) => {
    try {
        const data = await QUERY(SELECT_QUERY, req.user.id, req.user.id)
        return res.json({
            err: false,
            vacations: data
        })
    } catch (error) {
        return res.status(504).json({
            err: true,
            type: 'server',
            msg: error
        })
    }
})

// ONLY VERIFIED ADMIN ACCESS

router.use(verifyAuth)

router.get('/chart', async (req, res) => {
    try {
        const select_q = `SELECT vacations.title, COUNT(vac_likes.vac_id) AS followed
        FROM vacations
        INNER JOIN vac_likes WHERE vac_likes.vac_id = vacations.id
        GROUP BY vacations.title
        ORDER BY Followed ASC`
        const data = await QUERY(select_q)
        return res.json({
            err: false,
            chart: data
        })
    } catch (error) {
        return res.status(504).json({
            err: true,
            type: 'server',
            msg: error
        })
    }
})

router.post('/add', async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            picture,
            start_date,
            end_date
        } = req.body
        if (!title || !description || !price || !picture || !start_date || !end_date)
            return res.status(504).json({
                err: true,
                type: 'server',
                msg: `[SERVER] fill all fields`
            })
        const post_q = `INSERT INTO vacations (title, description, price, picture, start_date, end_date) VALUES(?, ?, ?, ?, ?, ?)`
        await QUERY(post_q, title, description, price, picture, start_date, end_date)
        const data = await QUERY(SELECT_QUERY, req.user.id, req.user.id)
        return res.json({
            err: false,
            msg: `[SERVER] ${title} vacation added succesfully `,
            vacations: data
        })
    } catch (error) {
        return res.status(504).json({
            err: true,
            type: 'server',
            msg: error
        })
    }
})
router.post('/edit', async (req, res) => {
    try {
        const {
            id,
            title,
            description,
            price,
            picture,
            start_date,
            end_date
        } = req.body
        if (!id || !title || !description || !price || !picture || !start_date || !end_date)
            return res.status(504).json({
                err: true,
                type: 'server',
                msg: `[SERVER] fill all fields`
            })
        const edit_q = `UPDATE vacations SET title = ?, description = ?, price = ?, picture = ?, start_date = ?, end_date = ? WHERE id = ?`
        await QUERY(edit_q, title, description, price, picture, start_date, end_date, id)
        const data = await QUERY(SELECT_QUERY, req.user.id, req.user.id)
        return res.json({
            err: false,
            msg: `[SERVER] ${title} vacation updated succesfully `,
            vacations: data
        })
    } catch (error) {
        return res.status(504).json({
            err: true,
            type: 'server',
            msg: error
        })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const delete_like_q = `DELETE FROM vac_likes WHERE vac_id = ?`
        const delete_vac_q = `DELETE FROM vacations WHERE id = ?`
        await QUERY(delete_like_q, id)
        await QUERY(delete_vac_q, id)
        const data = await QUERY(SELECT_QUERY, req.user.id, req.user.id)
        return res.json({
            err: false,
            msg: `[SERVER] vacation removed succesfully `,
            vacations: data
        })
    } catch (error) {
        console.log(error);
        return res.status(504).json({
            err: true,
            type: 'server',
            msg: '[SERVER] could not delete '
        })
    }
})

module.exports = router