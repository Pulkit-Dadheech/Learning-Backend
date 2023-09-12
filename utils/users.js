const db = require('../db/postgres');

const getUser = async (username) => {
    try {
        const query = 'SELECT username, password FROM users WHERE username = $1';
        const values = [username];
        const result = await db.query(query, values);

        if(result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (err) {
        console.error('Error retrieving user: ', err);
        throw err;
    }
}

module.exports = {
    getUser
}