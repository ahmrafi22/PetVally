"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Calendar as CalendarIcon, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type VetDoctor = {
  id: string;
  name: string;
  specialty: string[];
  country: string;
  city: string;
  area: string;
  contact: string;
  image: string | null;
};

type AppointmentFormValues = {
  date: Date | undefined;
  time: string;
  reason: string;
};

export default function VetInfoPage() {
  const [nearbyVets, setNearbyVets] = useState<VetDoctor[]>([]);
  const [allVets, setAllVets] = useState<VetDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData, fetchUserData, isLoading: userLoading } = useUserStore();
  const router = useRouter();
  const [selectedVetId, setSelectedVetId] = useState<string | null>(null);
  const [selectedVet, setSelectedVet] = useState<VetDoctor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState<AppointmentFormValues>({
    date: undefined,
    time: "",
    reason: "",
  });
  const [formErrors, setFormErrors] = useState<{
    date?: string;
    time?: string;
    reason?: string;
  }>({});

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("userToken");
    if (!userId || !token) {
      router.push("/userlogin");
      return;
    }
    fetchUserData();
  }, [fetchUserData, router]);

  useEffect(() => {
    if (!userLoading) {
      fetchVetInfo();
    }
  }, [userLoading, userData]);

  const fetchVetInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/userlogin");
        return;
      }

      const response = await fetch("/api/users/vetinfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vet information");
      }

      const data = await response.json();
      setNearbyVets(data.nearbyVets);
      setAllVets(data.allVets);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching vet info:", err);
      setError(err.message || "An error occurred while fetching vet information");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppointmentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setAppointmentData((prevData) => ({ ...prevData, date }));
    setFormErrors((prevErrors) => ({ ...prevErrors, date: undefined }));
  };

  const validateForm = () => {
    let isValid = true;
    const errors: { date?: string; time?: string; reason?: string } = {};

    if (!appointmentData.date) {
      errors.date = "Please select a date";
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(appointmentData.date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = "Cannot book appointments in the past";
        isValid = false;
      }
    }

    if (!appointmentData.time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      errors.time = "Please enter a valid time (HH:MM)";
      isValid = false;
    }

    if (appointmentData.reason.trim().length < 5) {
      errors.reason = "Please provide a more detailed reason (minimum 5 characters)";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleBookAppointment = (vet: VetDoctor) => {
    setSelectedVetId(vet.id);
    setSelectedVet(vet);
    setDialogOpen(true);
    setAppointmentData({ date: undefined, time: "", reason: "" });
    setFormErrors({});
  };

  const resetForm = () => {
    setAppointmentData({ date: undefined, time: "", reason: "" });
    setFormErrors({});
    setSelectedVetId(null);
    setSelectedVet(null);
  };

  const onSubmit = async () => {
    if (!selectedVetId) {
      toast.error("Please select a vet doctor");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) {
        toast.error("Authentication error. Please log in again");
        return;
      }

      const response = await fetch("/api/users/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vetId: selectedVetId,
          date: appointmentData.date?.toISOString(),
          time: appointmentData.time,
          reason: appointmentData.reason,
        }),
      });

      if (response.ok) {
        toast.success("Appointment booked successfully!");
        setDialogOpen(false); 
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to book appointment");
      }
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment. Please try again");
    }
  };

  const renderVetCard = (vet: VetDoctor) => (
    <div
      key={vet.id}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative w-32 h-32 mx-auto mt-6 rounded-full overflow-hidden border-4 border-pink-100">
        <img
          src={vet.image || "/placeholder.svg"}
          alt={vet.name}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{vet.name}</h3>
        
        <div className="my-3 inline-flex flex-wrap justify-center gap-1">
          {vet.specialty.map((spec, idx) => (
            <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
              {spec}
            </span>
          ))}
        </div>
        
        <p className="text-sm text-gray-600 flex items-center justify-center gap-2 mt-3">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{vet.area}, {vet.city}, {vet.country}</span>
        </p>
        
        <p className="text-sm text-gray-600 flex items-center justify-center gap-2 mt-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{vet.contact}</span>
        </p>
        
        <Button 
          onClick={() => handleBookAppointment(vet)} 
          className="mt-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 px-6"
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );

  const renderSkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      <Skeleton className="w-32 h-32 mx-auto mt-6 rounded-full" />
      <div className="p-6 text-center space-y-3">
        <Skeleton className="h-6 w-2/3 mx-auto" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
        <Skeleton className="h-10 w-1/2 mx-auto rounded-full mt-2" />
      </div>
    </div>
  );

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Veterinary Doctors</h1>

      {loading || userLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>{renderSkeletonCard()}</div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-100">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {nearbyVets.length > 0 && userData.city && userData.area && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-l-4 border-pink-500 pl-4">
                Vets Near You ({userData.area}, {userData.city})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyVets.map((vet) => renderVetCard(vet))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-l-4 border-blue-500 pl-4">
              All Veterinary Doctors
            </h2>
            {allVets.length === 0 ? (
              <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xl">No veterinary doctors listed yet.</p>
                <p className="mt-2">Check back later for available doctors.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allVets.map((vet) => renderVetCard(vet))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Booking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedVet && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Book Appointment with Dr. {selectedVet.name}</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Schedule an appointment for your pet&apos;s healthcare needs.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    Appointment Date
                  </Label>
                  <div className={`border rounded-md p-1 ${formErrors.date ? "border-red-500" : "border-gray-200"}`}>
                    <Calendar
                      mode="single"
                      selected={appointmentData.date}
                      onSelect={handleDateChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="mx-auto"
                    />
                  </div>
                  {formErrors.date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Preferred Time (HH:MM)
                  </Label>
                  <Input
                    id="time"
                    placeholder="e.g., 10:30"
                    name="time"
                    value={appointmentData.time}
                    onChange={handleInputChange}
                    className={formErrors.time ? "border-red-500" : ""}
                  />
                  {formErrors.time && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Describe your pet's symptoms or reason for the visit"
                    value={appointmentData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    className={formErrors.reason ? "border-red-500" : ""}
                  />
                  {formErrors.reason && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.reason}</p>
                  )}
                </div>
              </div>
              <DialogFooter className="flex gap-3 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onSubmit} 
                  className="flex-1 sm:flex-none bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  Book Appointment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}