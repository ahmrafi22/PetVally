// User types
export type User = {
  id: string
  name: string
  email: string
  password?: string
  age?: number | null
  image?: string | null
  country?: string | null
  city?: string | null
  area?: string | null
  dailyAvailability: number
  hasOutdoorSpace: boolean
  hasChildren: boolean
  hasAllergies: boolean
  experienceLevel: number
  createdAt: string
  updatedAt: string
  petOrders?: Array<{
    id: string
    pet: Pet
    createdAt: string
  }> 
}

export type UserProfile = Pick<User, "id" | "name" | "age" | "country" | "city" | "area">

export type UserPreferences = Pick<
  User,
  "id" | "dailyAvailability" | "hasOutdoorSpace" | "hasChildren" | "hasAllergies" | "experienceLevel"
>

export type UserImage = Pick<User, "id" | "image">

// Caregiver types
export type Caregiver = {
  id: string
  name: string
  email: string
  password?: string
  image?: string | null
  country?: string | null
  city?: string | null
  area?: string | null
  bio: string
  verified: boolean
  hourlyRate: number
  totalEarnings: number
  createdAt: string
  updatedAt: string
}

export type CaregiverProfile = Pick<
  Caregiver,
  "id" | "name" | "image" | "country" | "city" | "area" | "bio" | "hourlyRate"
>

export type CaregiverImage = Pick<Caregiver, "id" | "image">

// Pet types
export type Pet = {
  id: string
  name: string
  breed: string
  age: number
  price: number
  images: string
  isAvailable: boolean
  bio: string
  description: string
  energyLevel: number
  spaceRequired: number
  maintenance: number
  childFriendly: boolean
  allergySafe: boolean
  createdAt: string
  orders?: PetOrder[]
}

export type PetOrder = {
  id: string
  userId: string
  petId: string
  pet?: Pet
  createdAt: string
}

export type PaymentFormData = {
  cardNumber: string
  cardholderName: string
  expiryDate: string
  cvv: string
  address: string
  city: string
  country: string
  zipCode: string
}

