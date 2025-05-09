'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Visitors',
      data: [120, 190, 300, 500, 200],
      fill: false,
      borderColor: '#3b82f6',
      tension: 0.3,
    },
  ],
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
    },
  },
}

export default function ChartCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Website Traffic</h2>
      <Line data={data} options={options} />
    </div>
  )
}