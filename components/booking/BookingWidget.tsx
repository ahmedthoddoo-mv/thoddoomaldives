"use client";

import { useMemo, useState } from "react";
import { BookingRepository } from "@/lib/repositories";
import { buildBookingWhatsAppMessage, calculateBookingDraft } from "@/lib/booking";
import { validateBookingRequest } from "@/lib/bookings/bookingValidation";
import { createBookingEmailPreviews } from "@/lib/bookings/bookingEmails";
import { createBookingRequest } from "@/lib/bookings/bookingWorkflowStore";
import type { ContactPreference, BookingEmailPreview, BookingWorkflowRecord } from "@/types/booking-workflow";
import type { BookingDraft, BookingService, Room } from "@/types/booking";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { ExperienceSelector } from "@/components/booking/ExperienceSelector";
import { GuestForm } from "@/components/booking/GuestForm";
import { PriceCalculator } from "@/components/booking/PriceCalculator";
import { PropertyAvailabilityCard } from "@/components/booking/PropertyAvailabilityCard";
import { RoomSelector } from "@/components/booking/RoomSelector";
import { TransferSelector } from "@/components/booking/TransferSelector";

type BookingWidgetProps = {
  propertyName: string;
  propertySlug?: string;
  propertyId?: string;
  partnerId?: string;
  crmRecordId?: string;
  whatsapp: string;
  rooms: Room[];
};

const transferAndMealTypes = new Set<BookingService["type"]>(["transfer", "meal"]);
const experienceTypes = new Set<BookingService["type"]>(["experience", "rental", "custom"]);

export function BookingWidget({ propertyName, propertySlug, propertyId, partnerId, crmRecordId, whatsapp, rooms }: BookingWidgetProps) {
  const bookingOptionalServices = BookingRepository.findOptionalServices();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestWhatsapp, setGuestWhatsapp] = useState("");
  const [contactPreference, setContactPreference] = useState<ContactPreference>("whatsapp");
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id ?? "");
  const [selectedServices, setSelectedServices] = useState<BookingService[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedBooking, setSavedBooking] = useState<BookingWorkflowRecord | null>(null);
  const [emailPreviews, setEmailPreviews] = useState<BookingEmailPreview[]>([]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];

  const draft: BookingDraft = useMemo(
    () => ({
      propertyName,
      whatsapp,
      checkIn,
      checkOut,
      adults,
      children,
      roomType: selectedRoom?.name ?? "Room to be confirmed",
      roomRate: selectedRoom?.nightlyRate ?? 0,
      services: selectedServices,
      specialRequests
    }),
    [adults, checkIn, checkOut, children, propertyName, selectedRoom, selectedServices, specialRequests, whatsapp]
  );

  function toggleService(service: BookingService) {
    setSelectedServices((current) =>
      current.some((item) => item.id === service.id)
        ? current.filter((item) => item.id !== service.id)
        : [...current, service]
    );
  }

  function createPayload(status: "draft" | "pending") {
    const estimate = calculateBookingDraft(draft);

    return {
      propertyName,
      propertySlug,
      propertyId,
      partnerId,
      crmRecordId,
      whatsapp,
      checkIn,
      checkOut,
      adults,
      children,
      guestName,
      guestEmail,
      guestWhatsapp,
      contactPreference,
      roomType: selectedRoom?.name ?? "Room to be confirmed",
      roomRate: selectedRoom?.nightlyRate ?? 0,
      nights: estimate.nights,
      estimatedValue: estimate.total,
      commissionRate: estimate.commission.rate,
      companyRevenue: estimate.commission.companyRevenue,
      partnerRevenue: estimate.commission.partnerRevenue,
      specialRequests,
      status
    };
  }

  function handleSave(status: "draft" | "pending") {
    const payload = createPayload(status);
    const validation = validateBookingRequest(payload);

    setValidationErrors(validation.errors);

    if (!validation.valid) {
      return null;
    }

    const booking = createBookingRequest(payload);
    setSavedBooking(booking);
    setEmailPreviews(createBookingEmailPreviews(booking));
    return booking;
  }

  function openWhatsApp(action: string) {
    const booking = handleSave("pending");

    if (!booking) {
      return;
    }

    const message = `${action}\n\n${buildBookingWhatsAppMessage(draft)}\n\nGuest: ${guestName}\nEmail: ${guestEmail}\nWhatsApp: ${guestWhatsapp}\nContact preference: ${contactPreference}\nBooking ID: ${booking.id}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  }

  const transferServices = bookingOptionalServices.filter((service) => transferAndMealTypes.has(service.type));
  const experienceServices = bookingOptionalServices.filter((service) => experienceTypes.has(service.type));
  const selectedServiceIds = selectedServices.map((service) => service.id);

  return (
    <section className="bookingWidget" id="booking-widget">
      <div className="bookingWidgetHeader">
        <p className="eyebrow">Booking engine demo</p>
        <h2>Plan your stay and request a quote</h2>
        <p>Choose dates, room type, guests, transfers, meals, and local experiences. No payment is collected.</p>
      </div>

      <div className="bookingWidgetGrid">
        <div className="bookingWidgetForm">
          <BookingCalendar checkIn={checkIn} checkOut={checkOut} onCheckInChange={setCheckIn} onCheckOutChange={setCheckOut} />
          <GuestForm adults={adults} children={children} onAdultsChange={setAdults} onChildrenChange={setChildren} />
          <div className="bookingFormGrid">
            <label className="bookingField">
              <span>Guest name</span>
              <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Full name" />
            </label>
            <label className="bookingField">
              <span>Email</span>
              <input value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="guest@example.com" type="email" />
            </label>
            <label className="bookingField">
              <span>WhatsApp</span>
              <input value={guestWhatsapp} onChange={(event) => setGuestWhatsapp(event.target.value)} placeholder="+960 700 0000" />
            </label>
            <label className="bookingField">
              <span>Contact preference</span>
              <select value={contactPreference} onChange={(event) => setContactPreference(event.target.value as ContactPreference)}>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="either">Either</option>
              </select>
            </label>
          </div>
          <RoomSelector rooms={rooms} selectedRoomId={selectedRoomId} onChange={setSelectedRoomId} />
          <TransferSelector services={transferServices} selectedIds={selectedServiceIds} onToggle={toggleService} />
          <ExperienceSelector services={experienceServices} selectedIds={selectedServiceIds} onToggle={toggleService} />

          <label className="bookingField">
            <span>Special Requests</span>
            <textarea
              placeholder="Arrival time, room preference, dietary needs, honeymoon setup, private excursions..."
              value={specialRequests}
              onChange={(event) => setSpecialRequests(event.target.value)}
            />
          </label>

          <PriceCalculator draft={draft} />

          {validationErrors.length > 0 ? (
            <div className="bookingValidationPanel" role="alert">
              <strong>Please fix these details</strong>
              <ul>
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {savedBooking ? (
            <div className="bookingSuccessPanel">
              <strong>Booking request saved</strong>
              <p>{savedBooking.id} is now visible in Admin Bookings, Partner Dashboard, and the CRM demo timeline.</p>
            </div>
          ) : null}

          <div className="bookingActionGrid">
            <button type="button" onClick={() => openWhatsApp("Book via WhatsApp")}>Book via WhatsApp</button>
            <button type="button" onClick={() => handleSave("pending")}>Booking Request</button>
            <button type="button" onClick={() => openWhatsApp("Request Quote")}>Request Quote</button>
            <button type="button" onClick={() => handleSave("draft")}>Save Draft (demo)</button>
          </div>

          {emailPreviews.length > 0 ? (
            <div className="bookingEmailPreviewPanel">
              <h3>Email previews</h3>
              {emailPreviews.map((preview) => (
                <details key={preview.id}>
                  <summary>{preview.subject}</summary>
                  <pre>{preview.body}</pre>
                </details>
              ))}
            </div>
          ) : null}
        </div>

        <div className="bookingWidgetSide">
          <BookingSummary draft={draft} />
          <PropertyAvailabilityCard />
        </div>
      </div>
    </section>
  );
}
