import CleanSaaSLayout from "@/components/clean-saas-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CleanSaaSLayout>{children}</CleanSaaSLayout>
}
