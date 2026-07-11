import type { BookingWorkflowPayload } from "@/types/booking-workflow";

export function validateBookingRequest(payload: BookingWorkflowPayload) {
  const errors: string[] = [];
  const checkIn = payload.checkIn ? new Date(`${payload.checkIn}T00:00:00`) : null;
  const checkOut = payload.checkOut ? new Date(`${payload.checkOut}T00:00:00`) : null;

  if (!payload.checkIn) {
    errors.push("Choose a check-in date.");
  }

  if (!payload.checkOut) {
    errors.push("Choose a check-out date.");
  }

  if (checkIn && checkOut && checkOut <= checkIn) {
    errors.push("Check-out must be after check-in.");
  }

  if (!payload.guestName.trim()) {
    errors.push("Guest name is required.");
  }

  if (!payload.guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.guestEmail)) {
    errors.push("A valid email is required.");
  }

  if (!payload.guestWhatsapp.trim() || payload.guestWhatsapp.replace(/\D/g, "").length < 7) {
    errors.push("A valid WhatsApp number is required.");
  }

  if (payload.adults < 1) {
    errors.push("At least one adult is required.");
  }

  if (payload.children < 0) {
    errors.push("Children cannot be negative.");
  }

  if (payload.adults + payload.children < 1) {
    errors.push("Add at least one guest.");
  }

  if (!payload.roomType.trim()) {
    errors.push("Choose a room.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
