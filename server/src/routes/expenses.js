import express from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import {
  getOverview,
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  duplicateTransaction,
  bulkDeleteTransactions,
  bulkUpdateTransactions,
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  exportFinanceData,
} from '../controllers/expenseController.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/overview', getOverview)
router.get('/transactions', getTransactions)
router.get('/transactions/:id', getTransactionById)
router.post('/transactions', createTransaction)
router.put('/transactions/:id', updateTransaction)
router.delete('/transactions/:id', deleteTransaction)
router.post('/transactions/:id/duplicate', duplicateTransaction)
router.post('/transactions/bulk-delete', bulkDeleteTransactions)
router.post('/transactions/bulk-update', bulkUpdateTransactions)
router.get('/budgets', getBudgets)
router.post('/budgets', createBudget)
router.put('/budgets/:id', updateBudget)
router.delete('/budgets/:id', deleteBudget)
router.get('/goals', getGoals)
router.post('/goals', createGoal)
router.put('/goals/:id', updateGoal)
router.delete('/goals/:id', deleteGoal)
router.get('/export', exportFinanceData)

export default router
