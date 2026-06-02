'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import dayjs from 'dayjs'
import { toast } from 'sonner'

export type FinanceModalMode = 'transaction' | 'budget' | 'goal'

type TransactionForm = {
  type: 'income' | 'expense'
  amount: string
  category: string
  subcategory: string
  merchant: string
  notes: string
  paymentMethod: string
  tags: string
  date: string
  time: string
  currency: string
  recurringEnabled: boolean
  recurringFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  recurringInterval: string
  receiptImage: string
}

type BudgetForm = {
  name: string
  amount: string
  period: 'weekly' | 'monthly' | 'custom'
  category: string
  alertThreshold: string
  color: string
  notes: string
}

type GoalForm = {
  name: string
  targetAmount: string
  currentAmount: string
  deadline: string
  icon: string
  color: string
  notes: string
}

interface FinanceModalProps {
  mode: FinanceModalMode
  initialData?: any | null
  categories: string[]
  paymentMethods: string[]
  onSave: (data: any) => Promise<void> | void
  onClose: () => void
}

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#f97316', '#ef4444', '#6366f1']

const defaultTransaction = (): TransactionForm => ({
  type: 'expense',
  amount: '',
  category: 'Food',
  subcategory: '',
  merchant: '',
  notes: '',
  paymentMethod: 'Cash',
  tags: '',
  date: dayjs().format('YYYY-MM-DD'),
  time: dayjs().format('HH:mm'),
  currency: 'USD',
  recurringEnabled: false,
  recurringFrequency: 'monthly',
  recurringInterval: '1',
  receiptImage: '',
})

const defaultBudget = (): BudgetForm => ({
  name: '',
  amount: '',
  period: 'monthly',
  category: 'all',
  alertThreshold: '80',
  color: '#8b5cf6',
  notes: '',
})

const defaultGoal = (): GoalForm => ({
  name: '',
  targetAmount: '',
  currentAmount: '0',
  deadline: '',
  icon: '🎯',
  color: '#10b981',
  notes: '',
})

export function FinanceModal({ mode, initialData, categories, paymentMethods, onSave, onClose }: FinanceModalProps) {
  const [saving, setSaving] = useState(false)
  const [transaction, setTransaction] = useState<TransactionForm>(defaultTransaction())
  const [budget, setBudget] = useState<BudgetForm>(defaultBudget())
  const [goal, setGoal] = useState<GoalForm>(defaultGoal())

  const categoryOptions = useMemo(() => {
    const defaults = [
      'Food', 'Groceries', 'Dining Out', 'Transport', 'Fuel', 'Parking', 'Shopping', 'Clothing',
      'Electronics', 'Entertainment', 'Subscriptions', 'Rent', 'Utilities', 'Internet', 'Mobile Recharge',
      'Insurance', 'Education', 'Healthcare', 'Medicines', 'Fitness', 'Travel', 'Gifts', 'Investments',
      'Pets', 'Family', 'Home Maintenance', 'Taxes', 'Miscellaneous', 'Salary', 'Freelancing', 'Business',
      'Investments', 'Interest', 'Bonus', 'Refunds', 'Gifts', 'Other Income',
    ]
    return Array.from(new Set([...defaults, ...categories]))
  }, [categories])

  useEffect(() => {
    if (!initialData) {
      setTransaction(defaultTransaction())
      setBudget(defaultBudget())
      setGoal(defaultGoal())
      return
    }

    if (mode === 'transaction') {
      setTransaction({
        type: initialData.type ?? 'expense',
        amount: String(initialData.amount ?? ''),
        category: initialData.category ?? 'Food',
        subcategory: initialData.subcategory ?? '',
        merchant: initialData.merchant ?? '',
        notes: initialData.notes ?? '',
        paymentMethod: initialData.paymentMethod ?? 'Cash',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        date: initialData.date ? dayjs(initialData.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        time: initialData.time ?? dayjs().format('HH:mm'),
        currency: initialData.currency ?? 'USD',
        recurringEnabled: Boolean(initialData.recurring?.enabled),
        recurringFrequency: initialData.recurring?.frequency ?? 'monthly',
        recurringInterval: String(initialData.recurring?.interval ?? 1),
        receiptImage: initialData.receiptImage ?? '',
      })
    }

    if (mode === 'budget') {
      setBudget({
        name: initialData.name ?? '',
        amount: String(initialData.amount ?? ''),
        period: initialData.period ?? 'monthly',
        category: initialData.category ?? 'all',
        alertThreshold: String(initialData.alertThreshold ?? 80),
        color: initialData.color ?? '#8b5cf6',
        notes: initialData.notes ?? '',
      })
    }

    if (mode === 'goal') {
      setGoal({
        name: initialData.name ?? '',
        targetAmount: String(initialData.targetAmount ?? ''),
        currentAmount: String(initialData.currentAmount ?? 0),
        deadline: initialData.deadline ? dayjs(initialData.deadline).format('YYYY-MM-DD') : '',
        icon: initialData.icon ?? '🎯',
        color: initialData.color ?? '#10b981',
        notes: initialData.notes ?? '',
      })
    }
  }, [initialData, mode])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      if (mode === 'transaction') {
        if (!transaction.amount || !transaction.category) {
          toast.error('Amount and category are required')
          return
        }

        await onSave({
          ...transaction,
          amount: Number(transaction.amount),
          tags: transaction.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          recurring: {
            enabled: transaction.recurringEnabled,
            frequency: transaction.recurringFrequency,
            interval: Number(transaction.recurringInterval) || 1,
          },
          date: dayjs(transaction.date).toISOString(),
        })
      }

      if (mode === 'budget') {
        if (!budget.name || !budget.amount) {
          toast.error('Budget name and amount are required')
          return
        }

        await onSave({
          ...budget,
          amount: Number(budget.amount),
          alertThreshold: Number(budget.alertThreshold) || 80,
        })
      }

      if (mode === 'goal') {
        if (!goal.name || !goal.targetAmount) {
          toast.error('Goal name and target amount are required')
          return
        }

        await onSave({
          ...goal,
          targetAmount: Number(goal.targetAmount),
          currentAmount: Number(goal.currentAmount) || 0,
          deadline: goal.deadline ? dayjs(goal.deadline).toISOString() : null,
        })
      }

      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-t-[1.75rem] bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700 sm:max-h-[90vh] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-xl font-black text-gray-800 dark:text-white sm:text-2xl">
              {mode === 'transaction' && `${initialData ? 'Edit' : 'Add'} Transaction`}
              {mode === 'budget' && `${initialData ? 'Edit' : 'Add'} Budget`}
              {mode === 'goal' && `${initialData ? 'Edit' : 'Add'} Savings Goal`}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {mode === 'transaction' && 'Track income, expenses, subscriptions, and receipt details.'}
              {mode === 'budget' && 'Set budget targets and alerts.'}
              {mode === 'goal' && 'Track progress toward savings milestones.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
          {mode === 'transaction' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Type">
                  <select value={transaction.type} onChange={(event) => setTransaction({ ...transaction, type: event.target.value as 'income' | 'expense' })} className="input">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </Field>
                <Field label="Amount">
                  <input value={transaction.amount} onChange={(event) => setTransaction({ ...transaction, amount: event.target.value })} type="number" step="0.01" min="0" placeholder="0.00" className="input" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Category">
                  <select value={transaction.category} onChange={(event) => setTransaction({ ...transaction, category: event.target.value })} className="input">
                    {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Subcategory">
                  <input value={transaction.subcategory} onChange={(event) => setTransaction({ ...transaction, subcategory: event.target.value })} placeholder="Optional" className="input" />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Merchant">
                  <input value={transaction.merchant} onChange={(event) => setTransaction({ ...transaction, merchant: event.target.value })} placeholder="Merchant or payee" className="input" />
                </Field>
                <Field label="Payment Method">
                  <select value={transaction.paymentMethod} onChange={(event) => setTransaction({ ...transaction, paymentMethod: event.target.value })} className="input">
                    {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Date">
                  <input value={transaction.date} onChange={(event) => setTransaction({ ...transaction, date: event.target.value })} type="date" className="input" />
                </Field>
                <Field label="Time">
                  <input value={transaction.time} onChange={(event) => setTransaction({ ...transaction, time: event.target.value })} type="time" className="input" />
                </Field>
                <Field label="Currency">
                  <input value={transaction.currency} onChange={(event) => setTransaction({ ...transaction, currency: event.target.value })} placeholder="USD" className="input" />
                </Field>
              </div>

              <Field label="Tags">
                <input value={transaction.tags} onChange={(event) => setTransaction({ ...transaction, tags: event.target.value })} placeholder="travel, food, business" className="input" />
              </Field>

              <Field label="Notes">
                <textarea value={transaction.notes} onChange={(event) => setTransaction({ ...transaction, notes: event.target.value })} rows={4} placeholder="Add notes or context" className="input resize-none" />
              </Field>

              <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200 dark:bg-gray-800/60 dark:ring-gray-700">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={transaction.recurringEnabled} onChange={(event) => setTransaction({ ...transaction, recurringEnabled: event.target.checked })} />
                  Recurring transaction
                </label>
                <AnimatePresence>
                  {transaction.recurringEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid gap-4 md:grid-cols-2">
                      <Field label="Frequency">
                        <select value={transaction.recurringFrequency} onChange={(event) => setTransaction({ ...transaction, recurringFrequency: event.target.value as TransactionForm['recurringFrequency'] })} className="input">
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                          <option value="custom">Custom</option>
                        </select>
                      </Field>
                      <Field label="Interval">
                        <input value={transaction.recurringInterval} onChange={(event) => setTransaction({ ...transaction, recurringInterval: event.target.value })} type="number" min="1" className="input" />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {mode === 'budget' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Budget Name">
                  <input value={budget.name} onChange={(event) => setBudget({ ...budget, name: event.target.value })} placeholder="Monthly essentials" className="input" />
                </Field>
                <Field label="Amount">
                  <input value={budget.amount} onChange={(event) => setBudget({ ...budget, amount: event.target.value })} type="number" min="0" step="0.01" className="input" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Period">
                  <select value={budget.period} onChange={(event) => setBudget({ ...budget, period: event.target.value as BudgetForm['period'] })} className="input">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </Field>
                <Field label="Category">
                  <select value={budget.category} onChange={(event) => setBudget({ ...budget, category: event.target.value })} className="input">
                    <option value="all">All</option>
                    <option value="expense">All Expenses</option>
                    {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Alert %">
                  <input value={budget.alertThreshold} onChange={(event) => setBudget({ ...budget, alertThreshold: event.target.value })} type="number" min="1" max="100" className="input" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Color">
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button key={color} type="button" onClick={() => setBudget({ ...budget, color })} className={`h-10 w-10 rounded-xl border-2 ${budget.color === color ? 'border-gray-900 dark:border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </Field>
                <Field label="Notes">
                  <textarea value={budget.notes} onChange={(event) => setBudget({ ...budget, notes: event.target.value })} rows={4} className="input resize-none" />
                </Field>
              </div>
            </>
          )}

          {mode === 'goal' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Goal Name">
                  <input value={goal.name} onChange={(event) => setGoal({ ...goal, name: event.target.value })} placeholder="Emergency Fund" className="input" />
                </Field>
                <Field label="Target Amount">
                  <input value={goal.targetAmount} onChange={(event) => setGoal({ ...goal, targetAmount: event.target.value })} type="number" min="0" step="0.01" className="input" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Current Amount">
                  <input value={goal.currentAmount} onChange={(event) => setGoal({ ...goal, currentAmount: event.target.value })} type="number" min="0" step="0.01" className="input" />
                </Field>
                <Field label="Deadline">
                  <input value={goal.deadline} onChange={(event) => setGoal({ ...goal, deadline: event.target.value })} type="date" className="input" />
                </Field>
                <Field label="Icon">
                  <input value={goal.icon} onChange={(event) => setGoal({ ...goal, icon: event.target.value })} className="input" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Color">
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button key={color} type="button" onClick={() => setGoal({ ...goal, color })} className={`h-10 w-10 rounded-xl border-2 ${goal.color === color ? 'border-gray-900 dark:border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </Field>
                <Field label="Notes">
                  <textarea value={goal.notes} onChange={(event) => setGoal({ ...goal, notes: event.target.value })} rows={4} className="input resize-none" />
                </Field>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-800">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-50" style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  )
}
