const rows = [
    { id: 1, name: 'John Doe', status: 'Active' },
    { id: 2, name: 'Jane Smith', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', status: 'Pending' },
  ]
  
export default function DataTable() {
    return (
      <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">User List</h2>
        <table className="min-w-full table-auto text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6">{row.id}</td>
                <td className="py-3 px-6">{row.name}</td>
                <td className="py-3 px-6">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  