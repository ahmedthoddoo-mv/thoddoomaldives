"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { submitRealBookingRequest } from "@/app/booking/actions";
import { buildBookingWhatsAppMessage } from "@/lib/booking";
import { validateEnquiry } from "@/lib/production/workflow.mts";
import type { ContactPreference } from "@/types/booking-workflow";
import type { BookingDraft, BookingService, Room } from "@/types/booking";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { ExperienceSelector } from "@/components/booking/ExperienceSelector";
import { GuestForm } from "@/components/booking/GuestForm";
import { PriceCalculator } from "@/components/booking/PriceCalculator";
import { PropertyAvailabilityCard } from "@/components/booking/PropertyAvailabilityCard";
import { RoomSelector } from "@/components/booking/RoomSelector";
import { TransferSelector } from "@/components/booking/TransferSelector";
import { TurnstileWidget } from "@/components/booking/TurnstileWidget";
import type { RoomAvailability } from "@/types/availability";

type BookingWidgetProps = {
  propertyName: string;
  propertySlug?: string;
  propertyId?: string;
  whatsapp: string;
  rooms: Room[];
  optionalServices?: BookingService[];
  availability?: RoomAvailability[];
};

const transferAndMealTypes = new Set<BookingService["type"]>(["transfer", "meal"]);
const experienceTypes = new Set<BookingService["type"]>(["experience", "rental", "custom"]);

export function BookingWidget({ propertyName, propertySlug, propertyId, whatsapp, rooms, optionalServices = [], availability = [] }: BookingWidgetProps) {
  const bookingOptionalServices = optionalServices;
  const [isSubmitting, startSubmitting] = useTransition();
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
  const [savedBooking, setSavedBooking] = useState<{ id: string; reference: string } | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitFailed, setSubmitFailed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

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
      roomId: selectedRoom?.id,
      roomRate: selectedRoom?.nightlyRate ?? null,
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

  function validateClientInput() {
    return validateEnquiry({
      today: new Date().toISOString().slice(0, 10),
      checkIn,
      checkOut,
      adults,
      children,
      guestName,
      email: guestEmail,
      whatsapp: guestWhatsapp,
      contactPreference
    });
  }

  function submitBookingRequest() {
    const validation = validateClientInput();

    setValidationErrors(validation.errors);
    setSubmitMessage("");
    setSubmitFailed(false);

    if (!validation.valid) {
      return;
    }

    startSubmitting(async () => {
      const result = await submitRealBookingRequest({
        propertyId,
        propertySlug,
        roomId: selectedRoom?.id,
        selectedServiceIds,
        checkIn,
        checkOut,
        adults,
        children,
        guestName,
        guestEmail,
        guestWhatsapp,
        contactPreference,
        specialRequests,
        turnstileToken
      });

      if (!result.ok || !result.enquiry) {
        window.turnstile?.reset();
        setTurnstileToken("");
        setValidationErrors(result.errors ?? [result.message]);
        setSubmitMessage(result.message);
        setSubmitFailed(true);
        return;
      }

      setSavedBooking({ id: result.enquiry.id, reference: result.enquiry.reference });
      setSubmitMessage(result.message);
      setSubmitFailed(false);
      setValidationErrors([]);
    });
  }

  function openWhatsApp(action: string) {
    const validation = validateClientInput();
    setValidationErrors(validation.errors);
    if (!validation.valid) {
      return;
    }

    const message = `${action}\n\n${buildBookingWhatsAppMessage(draft)}\n\nGuest: ${guestName}\nEmail: ${guestEmail || "Not provided"}\nWhatsApp: ${guestWhatsapp || "Not provided"}\nContact preference: ${contactPreference}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  }

  const transferServices = bookingOptionalServices.filter((service) => transferAndMealTypes.has(service.type));
  const experienceServices = bookingOptionalServices.filter((service) => experienceTypes.has(service.type));
  const selectedServiceIds = selectedServices.map((service) => service.id);

  return (
    <section className="bookingWidget" id="booking-widget">
      <div className="bookingWidgetHeader">
        <p className="eyebrow">Request availability</p>
        <h2>Send a booking enquiry</h2>
        <p>The property will confirm availability and the final price. No payment is collected.</p>
      </div>

      <div className="bookingWidgetGrid">
        <div className="bookingWidgetForm">
          <BookingCalendar checkIn={checkIn} checkOut={checkOut} onCheckInChange={setCheckIn} onCheckOutChange={setCheckOut} />
          <GuestForm
            adults={adults}
            childCount={children}
            onAdultsChange={setAdults}
            onChildrenChange={setChildren}
          />
          <div className="bookingFormGrid">
            <label className="bookingField">
              <span>Guest name</span>
              <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Full name" />
            </label>
            <label className="bookingField">
              <span>Email</span>
              <input value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="Email address" type="email" />
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
          {transferServices.length > 0 ? <TransferSelector services={transferServices} selectedIds={selectedServiceIds} onToggle={toggleService} /> : null}
          {experienceServices.length > 0 ? <ExperienceSelector services={experienceServices} selectedIds={selectedServiceIds} onToggle={toggleService} /> : null}

          <label className="bookingField">
            <span>Special Requests</span>
            <textarea
              placeholder="Arrival time, room preference, dietary needs, honeymoon setup, private excursions..."
              value={specialRequests}
              onChange={(event) => setSpecialRequests(event.target.value)}
            />
          </label>

          <PriceCalculator draft={draft} />
          <TurnstileWidget onToken={setTurnstileToken} />

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
              <strong>Enquiry submitted</strong>
              <p>
                Reference: {savedBooking.reference ?? savedBooking.id}. This is not a confirmed booking.
              </p>
              <a className="adminPropertyActionLink" href={`/booking/success?reference=${encodeURIComponent(savedBooking.reference ?? savedBooking.id)}`}>
                View success page
              </a>
            </div>
          ) : null}

          {submitMessage && submitFailed ? (
            <div className="bookingValidationPanel" role="alert">
              <strong>Booking could not be submitted</strong>
              <p>{submitMessage}</p>
              <Link className="adminPropertyActionLink" href="/booking/failure">
                View failure page
              </Link>
            </div>
          ) : null}

          <div className="bookingActionGrid">
            <button type="button" onClick={() => openWhatsApp("Availability enquiry")}>Continue on WhatsApp</button>
            <button disabled={isSubmitting || !turnstileToken} type="button" onClick={submitBookingRequest}>
              {isSubmitting ? "Submitting..." : "Send enquiry"}
            </button>
          </div>

        </div>

        <div className="bookingWidgetSide">
          <BookingSummary draft={draft} />
          <PropertyAvailabilityCard availability={availability} />
        </div>
      </div>
    </section>
  );
}
