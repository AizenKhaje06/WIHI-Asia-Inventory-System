import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTransactions } from "@/lib/google-sheets"

export const dynamic = "force-dynamic"

export default async function RestockPage() {
  const transactions = await getTransactions()
  const restocks = transactions
    .filter((t) => t.type === "restock")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (restocks.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Restock History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No restock records yet.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Restock History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Quantity Added</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restocks.map((restock) => (
                <TableRow key={restock.id}>
                  <TableCell>{format(new Date(restock.timestamp), "PPPp")}</TableCell>
                  <TableCell>{restock.itemName}</TableCell>
                  <TableCell>{restock.quantity}</TableCell>
                  <TableCell>${restock.costPrice.toFixed(2)}</TableCell>
                  <TableCell>${restock.totalCost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
