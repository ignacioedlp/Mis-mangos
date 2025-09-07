import { getMonthlyDashboard } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react"
import { ExpenseActionButtons } from "@/components/expense-action-buttons"
import { BudgetAlerts } from "@/components/budget-alerts"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
   return (
      <div className="flex flex-col gap-6 w-full">
         <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Monthly Dashboard</h2>
            <p className="text-muted-foreground">Track your expenses and manage your monthly budget</p>
         </div>

         <BudgetAlerts />

         <DashboardStats />
         
         <div className="grid gap-6">
            <DashboardList />
         </div>
      </div>
   )
}

async function DashboardStats() {
   const data = await getMonthlyDashboard();
   const monthName = new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
   
   return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Estimated</CardTitle>
               <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{formatCurrency(data.totalEstimated)}</div>
               <p className="text-xs text-muted-foreground">{monthName}</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
               <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-green-600">{formatCurrency(data.totalPaid)}</div>
               <p className="text-xs text-muted-foreground">
                  {data.totalEstimated > 0 ? ((data.totalPaid / data.totalEstimated) * 100).toFixed(1) : 0}% completed
               </p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Pending</CardTitle>
               <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.totalPending)}</div>
               <p className="text-xs text-muted-foreground">
                  {data.items.filter(i => !i.isPaid).length} items remaining
               </p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Progress</CardTitle>
               <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{data.items.filter(i => i.isPaid).length}/{data.items.length}</div>
               <p className="text-xs text-muted-foreground">expenses completed</p>
            </CardContent>
         </Card>
      </div>
   );
}

async function DashboardList() {
   const data = await getMonthlyDashboard();
   const monthName = new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
   
   return (
      <Card>
         <CardHeader>
            <CardTitle className="flex items-center justify-between">
               <span>Expense List</span>
               <Badge variant="outline">{monthName}</Badge>
            </CardTitle>
            <CardDescription>
               Manage your monthly expenses and track payments
            </CardDescription>
         </CardHeader>
         <CardContent className="space-y-3">
            {data.items.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">
                  <p>No expenses found for this month.</p>
                  <p className="text-sm">Add some expenses to get started!</p>
               </div>
            ) : (
               <div className="space-y-2">
                  {data.items.map((item) => (
                     <div key={item.expenseId} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col space-y-1">
                           <div className="flex items-center gap-2">
                              <span className="font-medium">{item.name}</span>
                              {item.isPaid && <Badge variant="secondary" className="text-xs">Paid</Badge>}
                              {item.isSkipped && <Badge variant="outline" className="text-xs text-orange-600">Skipped</Badge>}
                           </div>
                           <span className="text-xs text-muted-foreground">
                              {item.categoryName} / {item.subcategoryName}
                           </span>
                           {item.paidAt && (
                              <span className="text-xs text-green-600">
                                 Paid on {new Date(item.paidAt).toLocaleDateString()}
                              </span>
                           )}
                           {item.skippedAt && (
                              <span className="text-xs text-orange-600">
                                 Skipped on {new Date(item.skippedAt).toLocaleDateString()}
                              </span>
                           )}
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-sm font-medium">{formatCurrency(item.estimatedAmount)}</span>
                           <ExpenseActionButtons
                              expenseId={item.expenseId}
                              expenseName={item.name}
                              estimatedAmount={item.estimatedAmount}
                              isPaid={item.isPaid}
                              isSkipped={item.isSkipped}
                              year={data.year}
                              month={data.month}
                           />
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </CardContent>
      </Card>
   )
}

