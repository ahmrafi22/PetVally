import PetVallyLogo from "@/components/_shared/logo";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 pt-2">
      <header className="w-full bg-white shadow-sm z-10 absolute top-0">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-center">

          <PetVallyLogo />

        </div>
      </header>
      <p className="text-3xl mb-6 text-gray-600">
        Landing page will be build later
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">User Portal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/userlogin">
              <Button className="w-full" variant="default">
                Login as User
              </Button>
            </Link>
            <Link href="/userregistration">
              <Button className="w-full" variant="secondary">
                Register as User
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Caregiver Portal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/caregiverlogin">
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Login as Caregiver
              </Button>
            </Link>
            <Link href="/caregiverregistration">
              <Button className="w-full" variant="secondary">
                Register as Caregiver
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/admin">
              <Button className="w-full bg-violet-500 hover:bg-violet-600">
                Login as Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
