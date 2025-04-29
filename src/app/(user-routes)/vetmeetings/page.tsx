// pages/vetmeetings.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/utils"; 

type AppointmentWithVet = {
  id: string;
  date: string; // Dates will be coming as strings from the API
  time: string;
  reason: string;
  vet: {
    id: string;
    name: string;
    image: string | null;
  };
};

export default function VetMeetingsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithVet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.push("/userlogin");
      return;
    }

    const fetchMeetings = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/users/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        // Filter out past appointments
        const upcomingAppointments = data.appointments.filter(
          (appt: AppointmentWithVet) => new Date(appt.date) >= new Date()
        );
        setAppointments(upcomingAppointments);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching appointments:", err);
        setError(err.message || "An error occurred while fetching appointments");
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [router]);

  const renderAppointmentCard = (appointment: AppointmentWithVet) => (
    <div
      key={appointment.id}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4"
    >
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-300">
          <img
            src={appointment.vet.image || "/placeholder.svg"}
            alt={appointment.vet.name}

            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{appointment.vet.name}</h3>
          <p className="text-sm text-gray-600">
            {formatDate(new Date(appointment.date))} at {appointment.time}
          </p>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-gray-700">Reason: {appointment.reason}</p>
      </div>
    </div>
  );

  const renderSkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="mt-2">
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Upcoming Vet Appointments</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>{renderSkeletonCard()}</div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="bg-gray-100 rounded-md p-6 text-center text-gray-600">
          <CalendarIcon className="w-6 h-6 mx-auto mb-2" />
          <p>You have no upcoming vet appointments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => renderAppointmentCard(appointment))}
        </div>
      )}
    </div>
  );
}