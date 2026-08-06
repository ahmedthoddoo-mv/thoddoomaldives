import type { TransferSchedule } from "@/types/transfer-schedule";

export type TransferEnquiryValues = {
  journeyType: "one-way" | "return";
  from: string;
  to: string;
  travelDate: string;
  passengers: number;
};

export type TransferDirectionGroup = {
  direction: string;
  routeLabel: string;
  schedules: TransferSchedule[];
};

export type TransferFleetGroup = {
  model: string;
  passengerCapacity: number | null;
  quantity: number;
  image: string;
  notes: string[];
  schedules: TransferSchedule[];
};

export type TransferScheduleExceptionItem = {
  date: string;
  direction: string;
  routeLabel: string;
  cancelled: boolean;
  departureTime?: string;
  notice?: string;
};

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

export function formatTransferTime(time: string) {
  return time.slice(0, 5);
}

export function buildTransferEnquiryMessage({
  companyName,
  values,
}: {
  companyName: string;
  values: TransferEnquiryValues;
}) {
  return `Hi,

I would like to check availability for ${companyName}.

Journey type: ${values.journeyType === "return" ? "Return" : "One way"}
From: ${values.from}
To: ${values.to}
Travel date: ${values.travelDate}
Passengers: ${values.passengers}

Please share the current schedule, pickup point, luggage guidance, and any Friday changes.
This is a request for availability only, not an online booking confirmation.

Thank you!
iThoddoo Maldives`;
}

export function groupTransferDirections(
  transfer: { departurePoint: string; arrivalPoint: string },
  schedules: TransferSchedule[]
): TransferDirectionGroup[] {
  const groups = new Map<string, TransferDirectionGroup>();

  for (const schedule of schedules) {
    const direction = schedule.direction.trim() || `${schedule.departurePoint} → ${schedule.arrivalPoint}`;
    const routeLabel = `${schedule.departurePoint} → ${schedule.arrivalPoint}`;
    const existing = groups.get(direction);

    if (existing) {
      existing.schedules.push(schedule);
      continue;
    }

    groups.set(direction, {
      direction,
      routeLabel,
      schedules: [schedule],
    });
  }

  const preferredOrder = [
    `${transfer.departurePoint} → ${transfer.arrivalPoint}`,
    `${transfer.arrivalPoint} → ${transfer.departurePoint}`,
  ];

  return Array.from(groups.values()).sort((left, right) => {
    const leftIndex = preferredOrder.findIndex((item) => item === left.routeLabel || item === left.direction);
    const rightIndex = preferredOrder.findIndex((item) => item === right.routeLabel || item === right.direction);

    if (leftIndex !== rightIndex) {
      return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
    }

    return left.direction.localeCompare(right.direction);
  });
}

function fleetNotesForSchedules(schedules: TransferSchedule[]) {
  const directions = uniqueValues(schedules.map((schedule) => schedule.direction));
  const notes = [
    directions.length > 0 ? `Seen in ${directions.join(" and ")}.` : undefined,
    uniqueValues(schedules.map((schedule) => schedule.luggagePolicy))[0],
    uniqueValues(schedules.map((schedule) => schedule.pickupDropoff))[0],
    uniqueValues(schedules.map((schedule) => schedule.weatherNotice))[0],
    uniqueValues(schedules.map((schedule) => schedule.cancellationNotice))[0],
  ].filter((item): item is string => Boolean(item));

  return notes.slice(0, 3);
}

export function groupTransferFleet(schedules: TransferSchedule[], image: string): TransferFleetGroup[] {
  const groups = new Map<string, TransferFleetGroup>();

  for (const schedule of schedules) {
    const model = schedule.vesselDetails?.trim();
    const passengerCapacity = schedule.vesselCapacity ?? null;

    if (!model && passengerCapacity === null) continue;

    const key = `${model ?? "fleet-details-on-request"}|${passengerCapacity ?? "na"}`;
    const existing = groups.get(key);

    if (existing) {
      existing.quantity += 1;
      existing.schedules.push(schedule);
      continue;
    }

    groups.set(key, {
      model: model ?? "Fleet details on request",
      passengerCapacity,
      quantity: 1,
      image,
      notes: [],
      schedules: [schedule],
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      notes: fleetNotesForSchedules(group.schedules),
    }))
    .sort((left, right) => right.quantity - left.quantity || left.model.localeCompare(right.model));
}

export function collectTransferExceptions(schedules: TransferSchedule[]): TransferScheduleExceptionItem[] {
  return schedules
    .flatMap((schedule) =>
      schedule.exceptions.map((exception) => ({
        date: exception.date,
        direction: schedule.direction,
        routeLabel: `${schedule.departurePoint} → ${schedule.arrivalPoint}`,
        cancelled: exception.cancelled,
        departureTime: exception.departureTime,
        notice: exception.notice,
      }))
    )
    .sort((left, right) => left.date.localeCompare(right.date) || left.direction.localeCompare(right.direction));
}
