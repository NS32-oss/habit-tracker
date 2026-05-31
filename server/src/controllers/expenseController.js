import ExpenseTransaction from '../models/ExpenseTransaction.js'
import ExpenseBudget from '../models/ExpenseBudget.js'
import SavingsGoal from '../models/SavingsGoal.js'
import dayjs from 'dayjs'
import mongoose from 'mongoose'

const DEFAULT_TRANSACTION_LIMIT = 500

const startOfCurrentDay = () => dayjs().startOf('day').toDate()
const startOfCurrentWeek = () => dayjs().startOf('week').toDate()
const startOfCurrentMonth = () => dayjs().startOf('month').toDate()
const startOfCurrentYear = () => dayjs().startOf('year').toDate()

const buildDateRange = (range = 'month') => {
  const end = dayjs().endOf('day').toDate()
  let start = startOfCurrentMonth()

  if (range === 'day') start = startOfCurrentDay()
  if (range === 'week') start = startOfCurrentWeek()
  if (range === 'month') start = startOfCurrentMonth()
  if (range === 'year') start = startOfCurrentYear()

  return { start, end }
}

const parseList = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

const getRangeSum = async (userId, type, start, end) => {
  const [result] = await ExpenseTransaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), type, archived: false, date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  return result?.total || 0
}

const getCategoryBreakdown = async (userId, type, start, end) => {
  const items = await ExpenseTransaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), type, archived: false, date: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ])

  return items.map((item) => ({ category: item._id, total: item.total, count: item.count }))
}

const buildOverview = async (userId) => {
  const todayStart = startOfCurrentDay()
  const weekStart = startOfCurrentWeek()
  const monthStart = startOfCurrentMonth()
  const monthEnd = dayjs().endOf('month').toDate()

  const [totalIncome, totalExpenses, dailySpending, weeklySpending, monthlySpending, budgets, goals, recentTransactions, recurringTransactions] = await Promise.all([
    getRangeSum(userId, 'income', new Date('1970-01-01'), dayjs().endOf('day').toDate()),
    getRangeSum(userId, 'expense', new Date('1970-01-01'), dayjs().endOf('day').toDate()),
    getRangeSum(userId, 'expense', todayStart, dayjs().endOf('day').toDate()),
    getRangeSum(userId, 'expense', weekStart, dayjs().endOf('day').toDate()),
    getRangeSum(userId, 'expense', monthStart, monthEnd),
    ExpenseBudget.find({ userId, active: true }).lean(),
    SavingsGoal.find({ userId, archived: false }).sort('-createdAt').lean(),
    ExpenseTransaction.find({ userId, archived: false }).sort('-date').limit(8).lean(),
    ExpenseTransaction.find({ userId, archived: false, 'recurring.enabled': true }).sort('-createdAt').lean(),
  ])

  const balance = totalIncome - totalExpenses
  const savingsAmount = Math.max(balance, 0)
  const savingsRate = totalIncome > 0 ? Math.round((savingsAmount / totalIncome) * 100) : 0
  const netCashFlow = totalIncome - totalExpenses

  const budgetTotals = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const remainingBudget = Math.max(budgetTotals - monthlySpending, 0)
  const budgetUsage = budgetTotals > 0 ? Math.round((monthlySpending / budgetTotals) * 100) : 0

  const totalGoalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalGoalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const goalProgress = totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        45 +
          savingsRate * 0.25 +
          Math.max(0, 25 - budgetUsage * 0.15) +
          Math.max(0, 20 - goals.filter((goal) => !goal.completed).length * 2)
      )
    )
  )

  const expenseTrend = await getCategoryBreakdown(userId, 'expense', monthStart, monthEnd)
  const incomeTrend = await getCategoryBreakdown(userId, 'income', monthStart, monthEnd)
  const upcomingRenewals = recurringTransactions
    .filter((transaction) => transaction.recurring?.nextRunDate || transaction.isSubscription)
    .slice(0, 6)

  return {
    totalBalance: balance,
    totalIncome,
    totalExpenses,
    savingsAmount,
    savingsRate,
    monthlySpending,
    weeklySpending,
    dailySpending,
    remainingBudget,
    netCashFlow,
    financialHealthScore: healthScore,
    budgetUsage,
    goalProgress,
    categoryBreakdown: expenseTrend,
    incomeBreakdown: incomeTrend,
    recentTransactions,
    recurringTransactions: upcomingRenewals,
    budgets,
    goals,
  }
}

export const getOverview = async (req, res, next) => {
  try {
    const overview = await buildOverview(req.userId)
    res.json(overview)
  } catch (error) {
    next(error)
  }
}

export const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      search = '',
      startDate,
      endDate,
      sortBy = 'date-desc',
      recurring,
      archived = 'false',
      limit = DEFAULT_TRANSACTION_LIMIT,
    } = req.query

    const query = {
      userId: req.userId,
      archived: archived === 'true',
    }

    if (type && type !== 'all') query.type = type
    if (category) query.category = category
    if (paymentMethod) query.paymentMethod = paymentMethod
    if (recurring === 'true') query['recurring.enabled'] = true
    if (recurring === 'false') query['recurring.enabled'] = { $ne: true }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    if (search) {
      const amountValue = Number(search)
      const amountMatch = !Number.isNaN(amountValue)
      query.$or = [
        { merchant: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
      if (amountMatch) {
        query.$or.push({ amount: amountValue })
      }
    }

    let sort = { date: -1, createdAt: -1 }
    if (sortBy === 'date-asc') sort = { date: 1, createdAt: 1 }
    if (sortBy === 'amount-desc') sort = { amount: -1, date: -1 }
    if (sortBy === 'amount-asc') sort = { amount: 1, date: -1 }
    if (sortBy === 'category') sort = { category: 1, date: -1 }

    const transactions = await ExpenseTransaction.find(query).sort(sort).limit(Number(limit)).lean()
    res.json(transactions)
  } catch (error) {
    next(error)
  }
}

export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await ExpenseTransaction.findOne({ _id: req.params.id, userId: req.userId }).lean()
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    res.json(transaction)
  } catch (error) {
    next(error)
  }
}

export const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      amount,
      category,
      subcategory = '',
      merchant = '',
      notes = '',
      paymentMethod = 'Other',
      tags = [],
      date,
      time = '',
      currency = 'USD',
      recurring = {},
      attachments = [],
      receiptImage = '',
      isSubscription = false,
      meta = {},
    } = req.body

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Transaction type is required' })
    }

    if (!category) {
      return res.status(400).json({ message: 'Category is required' })
    }

    const transaction = new ExpenseTransaction({
      userId: req.userId,
      type,
      amount: Number(amount) || 0,
      currency,
      category,
      subcategory,
      merchant,
      notes,
      paymentMethod,
      tags: parseList(tags),
      date: date ? new Date(date) : new Date(),
      time,
      recurring,
      attachments: parseList(attachments),
      receiptImage,
      isSubscription,
      meta,
    })

    await transaction.save()
    res.status(201).json(transaction)
  } catch (error) {
    next(error)
  }
}

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await ExpenseTransaction.findOne({ _id: req.params.id, userId: req.userId })
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    const allowed = [
      'type',
      'amount',
      'currency',
      'category',
      'subcategory',
      'merchant',
      'notes',
      'paymentMethod',
      'tags',
      'date',
      'time',
      'recurring',
      'attachments',
      'receiptImage',
      'archived',
      'isSubscription',
      'meta',
    ]

    allowed.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (field === 'date') {
          transaction.date = req.body.date ? new Date(req.body.date) : transaction.date
        } else if (field === 'tags' || field === 'attachments') {
          transaction[field] = parseList(req.body[field])
        } else if (field === 'amount') {
          transaction.amount = Number(req.body.amount) || 0
        } else {
          transaction[field] = req.body[field]
        }
      }
    })

    await transaction.save()
    res.json(transaction)
  } catch (error) {
    next(error)
  }
}

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await ExpenseTransaction.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    res.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const duplicateTransaction = async (req, res, next) => {
  try {
    const source = await ExpenseTransaction.findOne({ _id: req.params.id, userId: req.userId })
    if (!source) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    const duplicated = await ExpenseTransaction.create({
      ...source.toObject(),
      _id: undefined,
      userId: req.userId,
      duplicatedFrom: source._id,
      createdAt: undefined,
      updatedAt: undefined,
      date: new Date(),
    })

    res.status(201).json(duplicated)
  } catch (error) {
    next(error)
  }
}

export const bulkDeleteTransactions = async (req, res, next) => {
  try {
    const { ids = [] } = req.body
    await ExpenseTransaction.deleteMany({ _id: { $in: ids }, userId: req.userId })
    res.json({ message: 'Transactions deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const bulkUpdateTransactions = async (req, res, next) => {
  try {
    const { ids = [], updates = {} } = req.body
    const result = await ExpenseTransaction.updateMany(
      { _id: { $in: ids }, userId: req.userId },
      { $set: updates }
    )
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const getBudgets = async (req, res, next) => {
  try {
    const budgets = await ExpenseBudget.find({ userId: req.userId }).sort('-createdAt').lean()
    const overview = await buildOverview(req.userId)
    const categoryTotals = new Map(
      (overview.categoryBreakdown || []).map((item) => [item.category, item.total])
    )
    const expensesThisMonth = overview.monthlySpending

    const enriched = budgets.map((budget) => {
      const spent = budget.category && budget.category !== 'all'
        ? (categoryTotals.get(budget.category) || 0)
        : expensesThisMonth
      const progress = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0
      return {
        ...budget,
        spent,
        remaining: Math.max(budget.amount - spent, 0),
        progress,
      }
    })

    res.json(enriched)
  } catch (error) {
    next(error)
  }
}

export const createBudget = async (req, res, next) => {
  try {
    const budget = new ExpenseBudget({
      userId: req.userId,
      ...req.body,
    })
    await budget.save()
    res.status(201).json(budget)
  } catch (error) {
    next(error)
  }
}

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await ExpenseBudget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    )

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' })
    }

    res.json(budget)
  } catch (error) {
    next(error)
  }
}

export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await ExpenseBudget.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' })
    }

    res.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.userId }).sort('-createdAt').lean()
    const enriched = goals.map((goal) => ({
      ...goal,
      progress: goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0,
      remaining: Math.max(goal.targetAmount - goal.currentAmount, 0),
    }))
    res.json(enriched)
  } catch (error) {
    next(error)
  }
}

export const createGoal = async (req, res, next) => {
  try {
    const goal = new SavingsGoal({
      userId: req.userId,
      ...req.body,
    })
    await goal.save()
    res.status(201).json(goal)
  } catch (error) {
    next(error)
  }
}

export const updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    )

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    res.json(goal)
  } catch (error) {
    next(error)
  }
}

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    res.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const exportFinanceData = async (req, res, next) => {
  try {
    const format = (req.query.format || 'json').toLowerCase()
    const [transactions, budgets, goals] = await Promise.all([
      ExpenseTransaction.find({ userId: req.userId }).sort('-date').lean(),
      ExpenseBudget.find({ userId: req.userId }).lean(),
      SavingsGoal.find({ userId: req.userId }).lean(),
    ])

    if (format === 'csv') {
      const rows = [
        ['type', 'amount', 'category', 'subcategory', 'merchant', 'date', 'paymentMethod', 'notes', 'tags'].join(','),
        ...transactions.map((transaction) => [
          transaction.type,
          transaction.amount,
          transaction.category,
          transaction.subcategory || '',
          JSON.stringify(transaction.merchant || ''),
          dayjs(transaction.date).format('YYYY-MM-DD'),
          JSON.stringify(transaction.paymentMethod || ''),
          JSON.stringify(transaction.notes || ''),
          JSON.stringify((transaction.tags || []).join('|')),
        ].join(',')),
      ]
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename="finance-export.csv"')
      return res.send(rows.join('\n'))
    }

    res.json({ transactions, budgets, goals, exportedAt: new Date().toISOString() })
  } catch (error) {
    next(error)
  }
}
