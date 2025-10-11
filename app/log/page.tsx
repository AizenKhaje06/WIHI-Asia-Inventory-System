import { getLogs } from "@/lib/google-sheets"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function LogPage() {
  const logs = await getLogs()

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Operation History</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No operations logged yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{log.operation}</span>
                    </TableCell>
                    <TableCell>{log.itemName || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
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
