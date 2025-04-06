import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">User Portal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/userlogin">
              <Button className="w-full" variant="default">Login as User</Button>
            </Link>
            <Link href="/userregistration">
              <Button className="w-full" variant="secondary">Register as User</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Caregiver Portal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/caregiverlogin">
              <Button className="w-full bg-green-500 hover:bg-green-600">Login as Caregiver</Button>
            </Link>
            <Link href="/caregiverregistration">
              <Button className="w-full" variant="secondary">Register as Caregiver</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
