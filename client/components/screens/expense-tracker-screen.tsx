'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { expenseAPI } from '@/lib/api'
import { ExpenseDashboard } from '@/components/expense-dashboard'
import { ExpenseFilters, ExpenseSortType, ExpenseTypeFilter } from '@/components/expense-filters'
import { ExpenseTransactionCard, ExpenseTransaction } from '@/components/expense-transaction-card'
import { FinanceModal, FinanceModalMode } from '@/components/finance-modal'

const DEFAULT_CATEGORIES = [
  'Food', 'Groceries', 'Dining Out', 'Transport', 'Fuel', 'Parking', 'Shopping', 'Clothing',
  'Electronics', 'Entertainment', 'Subscriptions', 'Rent', 'Utilities', 'Internet', 'Mobile Recharge',
  'Insurance', 'Education', 'Healthcare', 'Medicines', 'Fitness', 'Travel', 'Gifts', 'Investments',
  'Pets', 'Family', 'Home Maintenance', 'Taxes', 'Miscellaneous', 'Salary', 'Freelancing', 'Business',
  'Interest', 'Bonus', 'Refunds', 'Other Income',
]

const DEFAULT_PAYMENT_METHODS = ['Cash', 'Debit Card', 'Credit Card', 'UPI', 'Bank Transfer', 'Wallet', 'Other']

type ViewSection = 'home' | 'transactions' | 'budgets' | 'goals' | 'subscriptions' | 'analytics'

export function ExpenseTrackerScreen() {
  const [overview, setOverview] = useState<any>(null)
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([])
  const [allTransactions, setAllTransactions] = useState<ExpenseTransaction[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [section, setSection] = useState<ViewSection>('home')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ExpenseTypeFilter>('all')
  const [sortBy, setSortBy] = useState<ExpenseSortType>('date-desc')
  const [category, setCategory] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<FinanceModalMode>('transaction')
  const [editingItem, setEditingItem] = useState<any | null>(null)

  const fetchOverview = useCallback(async () => {
    const [overviewData, budgetsData, goalsData, analyticsData] = await Promise.all([
      expenseAPI.getOverview(),
      expenseAPI.getBudgets(),
      expenseAPI.getGoals(),
      expenseAPI.getTransactions({ limit: 1000, sortBy: 'date-desc' }),
    ])

    setOverview(overviewData)
    setBudgets(budgetsData)
    setGoals(goalsData)
    setAllTransactions(analyticsData)
  }, [])

  const fetchTransactions = useCallback(async () => {
    const data = await expenseAPI.getTransactions({
      search,
      type: typeFilter === 'all' ? undefined : typeFilter === 'recurring' ? undefined : typeFilter,
      category,
      paymentMethod,
      sortBy,
      recurring: typeFilter === 'recurring' ? true : undefined,
      limit: 500,
    })
    setTransactions(data)
  }, [category, paymentMethod, search, sortBy, typeFilter])

  const loadAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([fetchOverview(), fetchTransactions()])
    } catch (err) {
      console.error('Failed to load expense data:', err)
      setError('Failed to load expense data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [fetchOverview, fetchTransactions])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!loading) {
      fetchTransactions().catch((err) => {
        console.error('Failed to refresh transactions:', err)
      })
    }
  }, [category, fetchTransactions, loading, paymentMethod, search, sortBy, typeFilter])

  const categoryOptions = useMemo(() => {
    const all = [...DEFAULT_CATEGORIES, ...transactions.map((item) => item.category), ...budgets.map((item) => item.category).filter(Boolean)]
    return Array.from(new Set(all.filter(Boolean))).sort()
  }, [budgets, transactions])

  const paymentOptions = useMemo(() => {
    const fromTransactions = transactions
      .map((item) => item.paymentMethod)
      .filter((m): m is string => Boolean(m))

    return Array.from(new Set<string>([...DEFAULT_PAYMENT_METHODS, ...fromTransactions])).sort()
  }, [transactions])

  const trendData = useMemo(() => {
    const days = 14
    const start = dayjs().subtract(days - 1, 'day')
    return Array.from({ length: days }).map((_, index) => {
      const current = start.add(index, 'day')
      const key = current.format('YYYY-MM-DD')
      const daily = allTransactions.filter((transaction) => dayjs(transaction.date).format('YYYY-MM-DD') === key)
      const income = daily.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount), 0)
      const expense = daily.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0)
      return {
        label: current.format('MMM D'),
        income,
        expense,
      }
    })
  }, [allTransactions])

  const categoryBreakdown = overview?.categoryBreakdown ?? []
  const recurringTransactions = overview?.recurringTransactions ?? transactions.filter((transaction) => transaction.recurring?.enabled)

  const openModal = (mode: FinanceModalMode, item: any | null = null) => {
    setModalMode(mode)
    setEditingItem(item)
    setModalOpen(true)
  }

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchOverview(), fetchTransactions()])
  }, [fetchOverview, fetchTransactions])

  const saveTransaction = async (data: any) => {
    if (editingItem?._id) {
      await expenseAPI.updateTransaction(editingItem._id, data)
      toast.success('Transaction updated')
    } else {
      await expenseAPI.createTransaction(data)
      toast.success('Transaction added')
    }
    setModalOpen(false)
    setEditingItem(null)
    await refreshAll()
  }

  const saveBudget = async (data: any) => {
    if (editingItem?._id && modalMode === 'budget') {
      await expenseAPI.updateBudget(editingItem._id, data)
      toast.success('Budget updated')
    } else {
      await expenseAPI.createBudget(data)
      toast.success('Budget added')
    }
    setModalOpen(false)
    setEditingItem(null)
    await refreshAll()
  }

  const saveGoal = async (data: any) => {
    if (editingItem?._id && modalMode === 'goal') {
      await expenseAPI.updateGoal(editingItem._id, data)
      toast.success('Goal updated')
    } else {
      await expenseAPI.createGoal(data)
      toast.success('Goal added')
    }
    setModalOpen(false)
    setEditingItem(null)
    await refreshAll()
  }

  const handleDeleteTransaction = async (id: string) => {
    await expenseAPI.deleteTransaction(id)
    toast.success('Transaction deleted')
    await refreshAll()
  }

  const handleDuplicateTransaction = async (id: string) => {
    await expenseAPI.duplicateTransaction(id)
    toast.success('Transaction duplicated')
    await refreshAll()
  }

  const handleArchiveTransaction = async (id: string) => {
    await expenseAPI.updateTransaction(id, { archived: true })
    toast.success('Transaction archived')
    await refreshAll()
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    await expenseAPI.bulkDeleteTransactions(selectedIds)
    toast.success(`${selectedIds.length} transactions deleted`)
    setSelectedIds([])
    await refreshAll()
  }

  const handleExport = async (format: 'csv' | 'json') => {
    const response = await expenseAPI.exportData(format)
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'finance-backup.json'
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Backup exported')
      return
    }

    const blob = new Blob([response], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'finance-export.csv'
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setSortBy('date-desc')
    setCategory('')
    setPaymentMethod('')
  }

  if (loading) {
    return <ExpenseLoadingState />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 p-4 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white">Unable to load finances</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
            <button onClick={loadAll} className="mt-6 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 px-5 py-3 font-semibold text-white">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 p-3 pb-28 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 sm:p-4 sm:pb-24">
      <div className="page-shell space-y-4 py-3 sm:space-y-6 sm:py-4">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white sm:text-4xl">Finance</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400 sm:text-base">Track cashflow, budgets, savings goals, recurring spending, and analytics in one workspace.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button onClick={() => openModal('transaction')} className="rounded-xl bg-linear-to-r from-purple-600 to-pink-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg sm:px-4 sm:py-3">
                + Transaction
              </button>
              <button onClick={() => openModal('budget')} className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 sm:px-4 sm:py-3">
                + Budget
              </button>
              <button onClick={() => openModal('goal')} className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 sm:px-4 sm:py-3">
                + Goal
              </button>
              <button onClick={() => handleExport('csv')} className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 sm:px-4 sm:py-3">
                Export CSV
              </button>
              <button onClick={() => handleExport('json')} className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 sm:px-4 sm:py-3">
                Backup JSON
              </button>
            </div>
          </div>

        </motion.div>

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {(['home', 'transactions', 'budgets', 'goals', 'subscriptions', 'analytics'] as ViewSection[]).map((item) => (
            <button
              key={item}
              onClick={() => setSection(item)}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                section === item
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700'
              }`}
            >
                {item === 'home' ? 'Finance Home' : item === 'transactions' ? 'Transactions' : item === 'budgets' ? 'Budgets' : item === 'goals' ? 'Savings Goals' : item === 'subscriptions' ? 'Subscriptions' : 'Analytics'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {section === 'home' && (
            <motion.section key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <div className="summary-grid">
                <InfoCard label="Savings Rate" value={`${overview?.savingsRate ?? 0}%`} helper="Income kept after expenses" />
                <InfoCard label="Net Cash Flow" value={`$${(overview?.netCashFlow ?? 0).toLocaleString()}`} helper="Income minus expenses" />
                <InfoCard label="Budget Usage" value={`${overview?.budgetUsage ?? 0}%`} helper="Current month budget usage" />
                <InfoCard label="Health Score" value={`${overview?.financialHealthScore ?? 0}/100`} helper="Composite finance score" />
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">Recent spending</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A quick look at your latest activity.</p>
                  </div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {overview?.recentTransactions?.length ?? 0} items
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {(overview?.recentTransactions ?? []).slice(0, 4).map((transaction: any) => (
                    <div key={transaction._id} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/60">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{transaction.merchant || transaction.category}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                        </div>
                        <p className={`text-lg font-black ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {section === 'transactions' && (
            <motion.section key="transactions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
              <ExpenseFilters
                search={search}
                onSearchChange={setSearch}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                category={category}
                onCategoryChange={setCategory}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                categories={categoryOptions}
                paymentMethods={paymentOptions}
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
                </p>
                <div className="flex items-center gap-2">
                  {selectedIds.length > 0 && (
                    <button onClick={handleBulkDelete} className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md">
                      Delete {selectedIds.length}
                    </button>
                  )}
                  <button onClick={clearFilters} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700">
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <EmptyState title="No transactions found" description="Try adjusting filters or add your first transaction." icon="🧾" />
                ) : (
                  transactions.map((transaction) => (
                    <ExpenseTransactionCard
                      key={transaction._id}
                      transaction={transaction}
                      selected={selectedIds.includes(transaction._id)}
                      onSelect={toggleSelection}
                      onEdit={(item) => openModal('transaction', item)}
                      onDelete={handleDeleteTransaction}
                      onDuplicate={handleDuplicateTransaction}
                      onArchive={handleArchiveTransaction}
                    />
                  ))
                )}
              </div>
            </motion.section>
          )}

          {section === 'budgets' && (
            <motion.section key="budgets" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 dark:text-white">Budgets</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly, weekly, and custom budget tracking.</p>
                </div>
                <button onClick={() => openModal('budget')} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md">
                  + Add Budget
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {budgets.length === 0 ? (
                  <div className="md:col-span-2 xl:col-span-3">
                    <EmptyState title="No budgets yet" description="Create a budget to get alerts and remaining budget calculations." icon="💡" />
                  </div>
                ) : (
                  budgets.map((budget) => (
                    <BudgetCard key={budget._id} budget={budget} onEdit={() => openModal('budget', budget)} />
                  ))
                )}
              </div>
            </motion.section>
          )}

          {section === 'goals' && (
            <motion.section key="goals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 dark:text-white">Savings Goals</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Build emergency funds, travel budgets, and milestone goals.</p>
                </div>
                <button onClick={() => openModal('goal')} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md">
                  + Add Goal
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {goals.length === 0 ? (
                  <div className="md:col-span-2 xl:col-span-3">
                    <EmptyState title="No savings goals yet" description="Add a target and track progress over time." icon="🎯" />
                  </div>
                ) : (
                  goals.map((goal) => (
                    <GoalCard key={goal._id} goal={goal} onEdit={() => openModal('goal', goal)} />
                  ))
                )}
              </div>
            </motion.section>
          )}

          {section === 'subscriptions' && (
            <motion.section key="subscriptions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white">Recurring & Subscriptions</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track renewal cadence and recurring spending.</p>
              </div>
              {recurringTransactions.length === 0 ? (
                <EmptyState title="No recurring items" description="Mark transactions as recurring to surface renewals here." icon="🔁" />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {recurringTransactions.map((item: any) => (
                    <div key={item._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{item.merchant || item.category}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                        </div>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {item.recurring?.frequency || 'Recurring'}
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-black text-gray-800 dark:text-white">${Number(item.amount).toFixed(2)}</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Next renewal insights are driven by your recurring transaction schedule.</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {section === 'analytics' && (
            <motion.section key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <ExpenseDashboard overview={overview} categoryBreakdown={categoryBreakdown} trendData={trendData} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard label="Income sources" value={`${overview?.incomeSources ?? 0}`} helper="Tracked income entries" />
                <InfoCard label="Expense categories" value={`${categoryBreakdown.length}`} helper="Active spending buckets" />
                <InfoCard label="Recurring items" value={`${recurringTransactions.length}`} helper="Subscriptions and repeat charges" />
                <InfoCard label="Tracked days" value={`${trendData.length}`} helper="Rolling 2-week window" />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <FinanceModal
            mode={modalMode}
            initialData={editingItem}
            categories={categoryOptions}
            paymentMethods={paymentOptions}
            onSave={modalMode === 'transaction' ? saveTransaction : modalMode === 'budget' ? saveBudget : saveGoal}
            onClose={() => {
              setModalOpen(false)
              setEditingItem(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function InfoCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-gray-800 dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helper}</p>
    </div>
  )
}

function BudgetCard({ budget, onEdit }: { budget: any; onEdit: () => void }) {
  const progress = budget.progress ?? 0
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{budget.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{budget.category} · {budget.period}</p>
        </div>
        <button onClick={onEdit} className="rounded-full px-3 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200 hover:bg-purple-50 dark:text-purple-300 dark:ring-purple-900/30 dark:hover:bg-purple-900/20">
          Edit
        </button>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Spent</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">${(budget.spent ?? 0).toLocaleString()} / ${budget.amount.toLocaleString()}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
          <div className={`h-2 rounded-full ${progress >= budget.alertThreshold ? 'bg-rose-500' : 'bg-linear-to-r from-purple-500 to-pink-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Remaining ${Math.max((budget.amount ?? 0) - (budget.spent ?? 0), 0).toLocaleString()}</p>
      </div>
    </div>
  )
}

function GoalCard({ goal, onEdit }: { goal: any; onEdit: () => void }) {
  const progress = goal.progress ?? 0
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{goal.icon}</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{goal.name}</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Target ${goal.targetAmount.toLocaleString()}</p>
        </div>
        <button onClick={onEdit} className="rounded-full px-3 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200 hover:bg-purple-50 dark:text-purple-300 dark:ring-purple-900/30 dark:hover:bg-purple-900/20">
          Edit
        </button>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">${(goal.currentAmount ?? 0).toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
          <div className="h-2 rounded-full bg-linear-to-r from-emerald-500 to-teal-500" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{progress}% completed</p>
      </div>
    </div>
  )
}

function EmptyState({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="text-xl font-black text-gray-800 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  )
}

function ExpenseLoadingState() {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 p-4 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900">
      <div className="space-y-6 page-shell py-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <div className="h-10 w-64 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="mt-3 h-5 w-96 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-700/60" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700" />
          ))}
        </div>
      </div>
    </div>
  )
}
