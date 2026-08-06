export type TransferScheduleException = {
  date: string;
  departureTime?: string;
  cancelled: boolean;
  notice?: string;
};

export type TransferSchedule = {
  id: string;
  transferId: string;
  direction: string;
  departurePoint: string;
  arrivalPoint: string;
  daysOfWeek: number[];
  departureTime: string;
  effectiveStart?: string;
  effectiveEnd?: string;
  fridaySpecific: boolean;
  price: number | null;
  currency: string;
  unit: string;
  vesselCapacity: number | null;
  vesselDetails?: string;
  luggagePolicy?: string;
  pickupDropoff?: string;
  cancellationNotice?: string;
  weatherNotice?: string;
  active: boolean;
  exceptions: TransferScheduleException[];
};
