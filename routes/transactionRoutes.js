const express = require('express');
const router = express.Router();
const {
    depositAmount,
    withdrawAmount,
    transferAmount,
    retrieveTransactions,
    fetch1OldestTransactions
} = require("../utils/transaction");
const {getUser} = require('../utils/users');
const {authenticate, authorize, adminOnly} = require("./middlewares");

router.use(authenticate);
router.use(authorize);

router.get('/', async (req, res) => {
    const userRole = req.user.role;
    const limit = req.query.limit;

    if (!limit) return res.status(400).json({error: 'Missing limit parameter'});

    try {
        const transactions = await retrieveTransactions(req.user, userRole, limit);
        return res.status(200).json({transactions});
    } catch (err) {
        console.error('Error retrieving transactions', err);
        return res.status(500).json({error: err.message});
    }
});

router.post('/', adminOnly, async (req, res) => {
    const {type} = req.query;

    try {
        if (type === 'deposit') {
            const {toUser, amount} = req.body;

            if (typeof amount !== 'number' || Number.isNaN ( amount ) ) {
                res.status(400).json({error: 'Amount is not valid'})
            }

            if (!toUser || !amount) return res.status(400).json({error: 'Missing toUser or amount'});

            const user = await getUser(toUser);
            if (!user) return res.status(404).json({error: 'User not found'});

            const depositTransaction = await depositAmount(user.user_id, amount);
            return res.status(201).json({"transaction": depositTransaction});
        } else if (type === 'withdraw') {
            const {fromUser, amount} = req.body;
            if (!fromUser || !amount) return res.status(400).json({error: 'Missing fromUser or amount'});

            const user = await getUser(fromUser);
            if (!user) return res.status(404).json({error: 'User not found'});

            const withdrawTransaction = await withdrawAmount(user.user_id, amount);
            if (!withdrawTransaction) return res.status(500).json({error: 'Error in creating transaction'});

            return res.status(201).json({"transaction": withdrawTransaction});
        } else if (type === 'transfer') {
            const {fromUser, toUser, amount} = req.body;
            if (!fromUser || !toUser || !amount) return res.status(401).json({error: 'Missing required data'});

            if (fromUser === toUser) return res.status(400).json({error: 'Invalid parameters'});

            const fromUserObject = await getUser(fromUser);
            if (!fromUserObject) return res.status(404).json({error: 'fromUser not found'});

            const toUserObject = await getUser(toUser);
            if (!toUserObject) return res.status(404).json({error: 'toUser not found'});

            const transferTransaction = await transferAmount(fromUserObject.user_id, toUserObject.user_id, amount);
            if (!transferTransaction) return res.status(500).json({error: 'Error while creating transaction'});

            return res.status(201).json({"transaction": transferTransaction});
        } else {
            return res.status(401).json({error: "Missing required parameter 'type'"});
        }
    } catch (err) {
        console.log("err", err);
        res.status(500).json({error: err.message});
    }
});

module.exports = router;

