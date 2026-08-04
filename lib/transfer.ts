import type { Transfer, TransferAvailabilitySnapshot, TransferEnquiryInput, TransferPricingUnit, TransferSchedule } from "@/types/transfer";

const MALDIVES_TIMEZONE = "Indian/Maldives";

const pricingUnitLabels: Record<TransferPricingUnit, string> = {
  "per-person-one-way": "per person · one way",
  "per-person-return": "per person · return",
  "per-group-one-way": "per group · one way",
  "per-group-return": "per group · return",
  "on-request": "pricing confirmed on request",
};

export function getTransferPricingUnitLabel(unit: TransferPricingUnit) {
  return pricingUnitLabels[unit];
}

function getMaldivesNow(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: MALDIVES_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
  return {
    weekday: parts.weekday,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function parseTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}

export function getScheduleDirectionTimes(schedule: TransferSchedule, directionLabel: string, weekday: string) {
  const direction = schedule.directions.find((item) => item.label === directionLabel);
  if (!direction) return [];

  if (directionLabel === "Thoddoo → Velana International Airport" && weekday === "Fri") {
    return ["06:45", "14:00"];
  }

  return direction.departures;
}

export function getNextDeparture(transfer: Transfer, now = new Date()) {
  if (!transfer.schedule) return null;
  const current = getMaldivesNow(now);
  const directions = transfer.schedule.directions.map((direction) => ({
    label: direction.label,
    times: getScheduleDirectionTimes(transfer.schedule as TransferSchedule, direction.label, current.weekday),
  }));

  const currentMinutes = current.hour * 60 + current.minute;
  for (const direction of directions) {
    for (const time of direction.times) {
      const parsed = parseTime(time);
      const minutes = parsed.hour * 60 + parsed.minute;
      if (minutes >= currentMinutes) {
        return {
          direction: direction.label,
          time,
          timezone: transfer.schedule.timezone,
        };
      }
    }
  }

  const firstDirection = directions.find((direction) => direction.times.length > 0);
  if (!firstDirection) return null;

  return {
    direction: firstDirection.label,
    time: firstDirection.times[0],
    timezone: transfer.schedule.timezone,
    nextDay: true,
  };
}

export function getAvailabilityMessage(availability?: TransferAvailabilitySnapshot) {
  if (!availability || !availability.isLive) {
    return "Availability confirmed after enquiry";
  }

  return availability.statusMessage;
}

export function buildTransferWhatsAppMessage(input: TransferEnquiryInput) {
  const totalPassengers = input.adults + input.children + input.infants;
  return [
    `Transfer enquiry for ${input.transferTitle}`,
    `Operator: ${input.operatorName}`,
    "",
    `Trip type: ${input.tripType === "return" ? "Return" : "One way"}`,
    `Route: ${input.from} → ${input.to}`,
    `Departure date: ${input.departureDate}`,
    ...(input.tripType === "return" ? [`Return date: ${input.returnDate || "To be confirmed"}`] : []),
    `Departure preference: ${input.departurePreference || "Best available scheduled service"}`,
    `Passengers: ${totalPassengers} total (${input.adults} adults, ${input.children} children, ${input.infants} infants)`,
    `Flight number: ${input.flightNumber || "Not provided"}`,
    `Flight time: ${input.flightTime || "Not provided"}`,
    `Guest name: ${input.guestName}`,
    `WhatsApp number: ${input.whatsappNumber}`,
    `Guesthouse or hotel: ${input.guesthouse || "Not provided"}`,
    `Special requests: ${input.specialRequests || "None"}`,
    "",
    "Please confirm the latest schedule and availability.",
    "I understand final availability is confirmed by iThoddoo Maldives or the operator and that this message is not an instant confirmation.",
  ].join("
");
}

export function validateTransferEnquiry(input: TransferEnquiryInput) {
  const errors: string[] = [];
  if (!input.from.trim()) errors.push("From is required.");
  if (!input.to.trim()) errors.push("To is required.");
  if (!input.departureDate.trim()) errors.push("Departure date is required.");
  if (input.tripType === "return" && !input.returnDate?.trim()) errors.push("Return date is required for return trips.");
  if (input.adults < 1) errors.push("At least one adult is required.");
  if (!input.guestName.trim()) errors.push("Guest name is required.");
  if (!input.whatsappNumber.trim()) errors.push("WhatsApp number is required.");
  return errors;
}
