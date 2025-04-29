// controllers/vet-info.ts
import { prisma } from "@/lib/prisma"

export async function getNearbyAndAllVets(userId: string) {
  try {
    // Fetch user's city and area
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { city: true, area: true },
    });

    if (!user?.city || !user?.area) {
      // If user location is not available, return all vets
      const allVets = await prisma.vetDoctor.findMany();
      return { nearbyVets: [], allVets };
    }

    // Fetch nearby vets (same city and area)
    const nearbyVets = await prisma.vetDoctor.findMany({
      where: {
        city: user.city,
        area: user.area,
      },
    });

    // Fetch all vets
    const allVets = await prisma.vetDoctor.findMany();

    return { nearbyVets, allVets };
  } catch (error) {
    console.error("Error in getNearbyAndAllVets:", error);
    throw error;
  }
}

export async function createAppointment(
  userId: string,
  vetId: string,
  date: Date,
  time: string,
  reason: string
) {
  try {
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        vetId,
        date,
        time,
        reason,
      },
    });
    return appointment;
  } catch (error) {
    console.error("Error in createAppointment:", error);
    throw error;
  }
}

export async function getUserAppointments(userId: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: userId,
      },
      include: {
        vet: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    return appointments;
  } catch (error) {
    console.error("Error in getUserAppointments:", error);
    throw error;
  }
}