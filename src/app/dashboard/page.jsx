import ChartCard from '@/app/components/ChartCard'
import DataTable from '@/app/components/DataTable'

export default function DashboardPage() {
  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard />
        <DataTable />
      </div>
    </main>
  )
}
