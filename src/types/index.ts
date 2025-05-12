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
  petOrders?: PetOrder[]
  ratings?: Rating[]
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
  phone: string
  verified: boolean
  hourlyRate: number
  totalEarnings: number
  createdAt: string
  updatedAt: string
}

export type CaregiverProfile = Pick<
  Caregiver,
  "id" | "name" | "image" | "country" | "city" | "area" | "bio" | "hourlyRate" | "phone"
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
  neutered: boolean
  vaccinated: boolean
  tags: string[]
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

export type Notification = {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image?: string
  category: string
  avgRating: number
  ratingCount: number
  ratings: Array<{
    id: string
    user: {
      name: string
      image?: string
    }
    rating: number
    comment?: string
    createdAt: string
  }>
}

export type ProductRating = {
  id: string
  rating: number
  comment: string | null
  userId: string
  productId: string
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
  }
}

export type CartItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image: string
  }
  totalPrice: number
}

export type Cart = {
  id: string
  userId: string
  items: CartItem[]
  totalPrice: number
}

export type ShippingInfo = {
  name: string
  address: string
  city: string
  state: string
  zip: string
  country: string
}

export type PaymentInfo = {
  cardNumber: string
  cardholderName: string
  expiryDate: string
  cvv: string
}

export type OrderItem = {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
}

export type Order = {
  id: string
  userId: string
  user: {
    name: string
    email: string
  }
  totalPrice: number
  status: "PENDING" | "COMPLETED" | "CANCELLED"
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  shippingName: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
}

interface Rating {
  id: string
  rating: number
  comment?: string
  productId: string
  userId: string
  productname:string
}