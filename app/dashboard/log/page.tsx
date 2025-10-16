import { getLogs } from "@/lib/google-sheets"
import type { Log } from "@/lib/types"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const dynamic = 'force-dynamic'

export default async function LogPage() {
  const logs = await getLogs()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-slate-800 bg-clip-text text-transparent mb-2">Operation History</h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">View all system operations and changes</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Operation History</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No operations logged yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Date & Time</TableHead>
                  <TableHead className="w-[15%]">Operation</TableHead>
                  <TableHead className="w-[25%]">Item</TableHead>
                  <TableHead className="w-[40%]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium w-[20%]">
                      {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell className="w-[15%]">
                      <span className="capitalize">{log.operation}</span>
                    </TableCell>
                    <TableCell className="w-[25%]">{log.itemName || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground w-[40%]">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
