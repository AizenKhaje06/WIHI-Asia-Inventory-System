import ClientLayout from "@/components/client-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
