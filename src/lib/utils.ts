import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


import { format } from 'date-fns';

export function formatDate(date: Date) {
  return format(date, 'MMMM d, yyyy');
}