import express from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import { upsertNote, getNotesInRange } from '../controllers/dayNoteController.js'

const router = express.Router()

router.put('/', authMiddleware, upsertNote)
router.get('/', authMiddleware, getNotesInRange)

export default router
