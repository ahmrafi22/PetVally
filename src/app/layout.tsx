import type React from "react"
import './globals.css'
import { Toaster } from "sonner"
import type { Metadata } from "next"
import { Inter } from "next/font/google"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PetVally"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>

        <Toaster richColors={true}/>
        {children}</body>
    </html>
  )
}




