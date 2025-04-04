import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">User Portal</h2>
          <div className="space-y-4">
            <Link
              href="/userlogin"
              className="block w-full text-center py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login as User
            </Link>
            <Link
              href="/userregistration"
              className="block w-full text-center py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Register as User
            </Link>
          </div>
        </div>
        <div className="p-6 border rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Caregiver Portal</h2>
          <div className="space-y-4">
            <Link
              href="/caregiverlogin"
              className="block w-full text-center py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Login as Caregiver
            </Link>
            <Link
              href="/caregiverregistration"
              className="block w-full text-center py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Register as Caregiver
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

