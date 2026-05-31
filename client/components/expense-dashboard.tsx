'use client'

import { motion } from 'framer-motion'
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ExpenseDashboardProps {
  overview: any
  categoryBreakdown: { category: string; total: number }[]
  trendData: { label: string; income: number; expense: number }[]
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#f97316', '#ef4444', '#6366f1']

export function ExpenseDashboard({ overview, categoryBreakdown, trendData }: ExpenseDashboardProps) {
  const statCards = [
    { label: 'Total Balance', value: overview?.totalBalance ?? 0, tone: 'violet', prefix: '$' },
    { label: 'Income', value: overview?.totalIncome ?? 0, tone: 'emerald', prefix: '$' },
    { label: 'Expenses', value: overview?.totalExpenses ?? 0, tone: 'rose', prefix: '$' },
    { label: 'Savings', value: overview?.savingsAmount ?? 0, tone: 'indigo', prefix: '$' },
    { label: 'Remaining Budget', value: overview?.remainingBudget ?? 0, tone: 'amber', prefix: '$' },
    { label: 'Financial Score', value: overview?.financialHealthScore ?? 0, tone: 'slate', suffix: '/100' },
  ]
  const toneClasses: Record<string, string> = {
    violet: 'bg-violet-600',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
    indigo: 'bg-indigo-600',
    amber: 'bg-amber-500',
    slate: 'bg-slate-700',
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-2xl p-5 text-white shadow-lg ${toneClasses[card.tone]}`}
          >
            <p className="text-sm/6 text-white/80">{card.label}</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-black tracking-tight">
                {card.prefix ?? ''}
                {typeof card.value === 'number' && card.label !== 'Financial Score'
                  ? card.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : card.value}
              </span>
              {card.suffix && <span className="pb-1 text-sm font-semibold text-white/80">{card.suffix}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Spending by Category</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current month expense distribution</p>
            </div>
            <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {overview?.monthlySpending ?? 0} spent this month
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="total" nameKey="category" innerRadius={70} outerRadius={105} paddingAngle={4}>
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Cash Flow Trend</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Income vs expense over recent days</p>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Monthly Spending" value={overview?.monthlySpending ?? 0} tone="rose" />
        <MiniMetric label="Weekly Spending" value={overview?.weeklySpending ?? 0} tone="orange" />
        <MiniMetric label="Daily Spending" value={overview?.dailySpending ?? 0} tone="amber" />
        <MiniMetric label="Savings Rate" value={overview?.savingsRate ?? 0} tone="emerald" suffix="%" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InsightCard
          title="Smart Insight"
          value={overview?.categoryBreakdown?.[0]?.category || 'No spending data yet'}
          description="Highest spending category this month"
        />
        <InsightCard
          title="Budget Pressure"
          value={`${overview?.budgetUsage ?? 0}%`}
          description="Share of active budgets used this month"
        />
        <InsightCard
          title="Goals Progress"
          value={`${overview?.goalProgress ?? 0}%`}
          description="Overall savings goal completion"
        />
      </div>
    </div>
  )
}

function MiniMetric({ label, value, tone, suffix = '$' }: { label: string; value: number; tone: 'rose' | 'orange' | 'amber' | 'emerald'; suffix?: string }) {
  const toneClasses: Record<string, string> = {
    rose: 'bg-rose-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold text-white ${toneClasses[tone]}`}>
        {suffix === '%' ? `${value}%` : `${suffix}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      </div>
    </div>
  )
}

function InsightCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-black text-gray-800 dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
