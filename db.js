const sql = require('mysql')
const {
    SQL_HOST,
    SQL_USER,
    SQL_PASSWORD,
    SQL_DATABASE
} = process.env


const sqlConnection = sql.createConnection({
    host: SQL_HOST,
    user: SQL_USER,
    password: SQL_PASSWORD,
    database: SQL_DATABASE
})
// const sqlConnection = sql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'vacation_project'
// })

console.log(`[SQL] connected`);

const QUERY = (q, ...values) =>{
    return new Promise ((resolve, reject)=>{
        sqlConnection.query(q, values, (error, response)=>{
            error ? reject(error) : resolve(response)
        })
    })
}

module.exports = { QUERY }