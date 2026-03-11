import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Packer Dashboard',
  description: 'Order packing and fulfillment'
}

export default function PackerLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto p-6">
        {children}
      </div>
    </div>
  )
}
