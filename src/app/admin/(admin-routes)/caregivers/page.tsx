"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CheckCircle, XCircle, User, DollarSign, Clock, MapPin } from "lucide-react"

interface Caregiver {
  id: string
  name: string
  email: string
  image?: string | null
  country?: string | null
  city?: string | null
  area?: string | null
  bio: string
  verified: boolean
  hourlyRate: number
  totalEarnings: number
  createdAt: string
}

export default function CaregiverVerificationPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCaregivers()
  }, [])

  const fetchCaregivers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/caregivers")
      const data = await response.json()

      if (data.caregivers) {
        setCaregivers(data.caregivers)
      }
    } catch (error) {
      console.error("Error fetching caregivers:", error)
      toast.error("Failed to fetch caregivers", {
        description: "An error occurred while fetching caregiver data.",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateVerificationStatus = async (id: string, verified: boolean) => {
    try {
      setUpdating(id)
      const response = await fetch(`/api/admin/caregivers/${id}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verified }),
      })

      const data = await response.json()

      if (data.caregiver) {
        setCaregivers(caregivers.map((c) => (c.id === id ? { ...c, verified: data.caregiver.verified } : c)))
        toast.success(`Caregiver ${verified ? "verified" : "unverified"} successfully`)
      } else {
        console.error("Failed to update verification, no caregiver data in response:", data);
        toast.error("Failed to update verification status", {
            description: data.error || "Received unexpected response from the server.",
        });
    }
    } catch (error) {
      console.error("Error updating caregiver verification status:", error)
      toast.error("Failed to update caregiver verification status", {
        description: "An error occurred while updating the status.",
      })
    } finally {
      setUpdating(null)
    }
  }


  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Caregiver Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 border-b last:border-b-0 py-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-grow">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-[100px] hidden sm:block" />
                  <Skeleton className="h-4 w-[80px] hidden md:block" />
                  <Skeleton className="h-4 w-[80px] hidden lg:block" />
                  <Skeleton className="h-4 w-[80px] hidden lg:block" />
                  <Skeleton className="h-6 w-[100px] ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[200px]">Caregiver</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden sm:table-cell">Location</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">Hourly Rate</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden lg:table-cell">Total Earnings</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden lg:table-cell">Joined</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {caregivers.length === 0 ? (
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td colSpan={7} className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center py-8 text-muted-foreground">
                        No caregivers found
                      </td>
                    </tr>
                  ) : (
                    caregivers.map((caregiver) => (
                      <tr key={caregiver.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={caregiver.image || ""} alt={caregiver.name} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{caregiver.name}</div>
                              <div className="text-sm text-muted-foreground">{caregiver.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {[caregiver.area, caregiver.city, caregiver.country].filter(Boolean).join(", ") ||
                                "Not specified"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>${caregiver.hourlyRate}/hr</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>${caregiver.totalEarnings}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(caregiver.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {caregiver.verified ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                              <XCircle className="h-3 w-3 mr-1" /> Unverified
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={caregiver.verified}
                              disabled={updating === caregiver.id}
                              onCheckedChange={(checked) => updateVerificationStatus(caregiver.id, checked)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}