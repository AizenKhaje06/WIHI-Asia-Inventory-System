import { getLogs } from "@/lib/google-sheets"
import type { Log } from "@/lib/types"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function LogPage() {
  const logs = await getLogs()

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Operation History
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          View all system operations and changes
        </p>
      </div>
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              <Database className="h-5 w-5" />
            </div>
            Operation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-8">No operations logged yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="min-w-full inline-block align-middle">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 dark:border-slate-700">
                      <TableHead className="text-slate-600 dark:text-slate-400 whitespace-nowrap">Date & Time</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400 whitespace-nowrap">Operation</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400 whitespace-nowrap">Item</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400 whitespace-nowrap">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                        <TableCell className="font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell className="text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          <span className="capitalize">{log.operation}</span>
                        </TableCell>
                        <TableCell className="text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-[200px] truncate" title={log.itemName || '-'}>
                          {log.itemName || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-400 max-w-[300px] truncate" title={log.details}>
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
