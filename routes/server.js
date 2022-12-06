import {Router} from 'express';
import {users} from '../users.js';

const router = Router();

router.get("/users/list", (req, res) => {
    res.json(users)
});

export default router;
