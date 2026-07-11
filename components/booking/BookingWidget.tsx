"use client";

import { useMemo, useState } from "react";
import { BookingRepository } from "@/lib/repositories";
import { buildBookingWhatsAppMessage } from "@/lib/booking";
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
  whatsapp: string;
  rooms: Room[];
};

const transferAndMealTypes = new Set<BookingService["type"]>(["transfer", "meal"]);
const experienceTypes = new Set<BookingService["type"]>(["experience", "rental", "custom"]);

export function BookingWidget({ propertyName, whatsapp, rooms }: BookingWidgetProps) {
  const bookingOptionalServices = BookingRepository.findOptionalServices();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id ?? "");
  const [selectedServices, setSelectedServices] = useState<BookingService[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");

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

  function openWhatsApp(action: string) {
    const message = `${action}\n\n${buildBookingWhatsAppMessage(draft)}`;
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

          <div className="bookingActionGrid">
            <button type="button" onClick={() => openWhatsApp("Book via WhatsApp")}>Book via WhatsApp</button>
            <button type="button" onClick={() => openWhatsApp("Send Inquiry")}>Send Inquiry</button>
            <button type="button" onClick={() => openWhatsApp("Request Quote")}>Request Quote</button>
            <button type="button">Save Draft (demo)</button>
          </div>
        </div>

        <div className="bookingWidgetSide">
          <BookingSummary draft={draft} />
          <PropertyAvailabilityCard />
        </div>
      </div>
    </section>
  );
}
