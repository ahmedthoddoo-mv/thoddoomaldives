"use client";

import { useState, useTransition } from "react";
import { savePartnerManualAvailability, savePartnerTransferSchedule } from "@/app/partner/actions";
import type { Booking } from "@/types/booking";
import type { RoomAvailability } from "@/types/availability";
import type { TransferSchedule } from "@/types/transfer-schedule";
import type { PartnerPortalServiceItem } from "@/lib/partner-portal/partnerAccess";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function blankSchedule(index: number): TransferSchedule {
  return { id: `new-${index}`, transferId: "", direction: "Thoddoo → Malé Airport", departurePoint: "Thoddoo", arrivalPoint: "Malé Airport", daysOfWeek: [0,1,2,3,4,5,6], departureTime: "06:45", fridaySpecific: false, price: 35, currency: "USD", unit: "per person one way", vesselCapacity: null, luggagePolicy: "", pickupDropoff: "", cancellationNotice: "", weatherNotice: "Weather dependent", active: true, exceptions: [] };
}

export function PartnerCalendarView({ bookings, schedules: initialSchedules = [], availability: initialAvailability = [], rooms = [], businessType = "guesthouse" }: { bookings: Booking[]; schedules?: TransferSchedule[]; availability?: RoomAvailability[]; rooms?: PartnerPortalServiceItem[]; businessType?: string }) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [availability, setAvailability] = useState(initialAvailability);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  if (businessType.includes("transfer") || businessType.includes("speedboat") || businessType.includes("ferry")) {
    return <section className="partnerPortalPanel"><div className="partnerPortalSectionHeader"><p className="eyebrow">Operational timetable</p><h2>Transfer departures</h2><button type="button" onClick={() => setSchedules((items) => [...items, blankSchedule(items.length)])}>Add departure</button></div>
      <div className="partnerPortalServiceEditor">{schedules.map((schedule, index) => <article className="partnerPortalPanel" key={schedule.id}><div className="partnerPortalFormGrid">
        {([['direction','Direction'],['departurePoint','Departure point'],['arrivalPoint','Arrival point'],['departureTime','Departure time'],['price','Price'],['unit','Price unit'],['vesselCapacity','Vessel capacity'],['vesselDetails','Vessel details'],['luggagePolicy','Luggage'],['pickupDropoff','Pickup/drop-off'],['cancellationNotice','Cancellation policy'],['weatherNotice','Weather notice']] as const).map(([key,label]) => <label key={key}><span>{label}</span><input type={key === 'departureTime' ? 'time' : key === 'price' || key === 'vesselCapacity' ? 'number' : 'text'} value={String(schedule[key] ?? '')} onChange={(event) => setSchedules((items) => items.map((item,i) => i === index ? {...item,[key]: key === 'price' || key === 'vesselCapacity' ? (event.target.value ? Number(event.target.value) : null) : event.target.value} : item))} /></label>)}
        <fieldset className="partnerPortalWide"><legend>Operating days</legend>{dayNames.map((day, dayIndex) => <label key={day}><input type="checkbox" checked={schedule.daysOfWeek.includes(dayIndex)} onChange={() => setSchedules((items) => items.map((item,i) => i === index ? {...item,daysOfWeek:item.daysOfWeek.includes(dayIndex) ? item.daysOfWeek.filter((value) => value !== dayIndex) : [...item.daysOfWeek,dayIndex].sort()} : item))} /> {day}</label>)}</fieldset>
        <label><span>Exception date</span><input type="date" value={schedule.exceptions[0]?.date ?? ''} onChange={(event) => setSchedules((items) => items.map((item,i) => i === index ? {...item,exceptions:event.target.value ? [{date:event.target.value,departureTime:item.exceptions[0]?.departureTime,cancelled:item.exceptions[0]?.cancelled ?? false,notice:item.exceptions[0]?.notice}] : []} : item))} /></label>
        <label><span>Exception time</span><input type="time" value={schedule.exceptions[0]?.departureTime ?? ''} onChange={(event) => setSchedules((items) => items.map((item,i) => i === index ? {...item,exceptions:item.exceptions.map((exception,j) => j === 0 ? {...exception,departureTime:event.target.value} : exception)} : item))} /></label>
        <label><span><input type="checkbox" checked={schedule.active} onChange={(event) => setSchedules((items) => items.map((item,i) => i === index ? {...item,active:event.target.checked} : item))} /> Active departure</span></label>
      </div><button disabled={pending} type="button" onClick={() => startTransition(async () => setMessage((await savePartnerTransferSchedule(schedule)).message))}>Save departure</button></article>)}</div><p role="status">{message}</p></section>;
  }

  const today = new Date().toISOString().slice(0,10);
  return <div className="partnerPortalStack"><section className="partnerPortalPanel"><div className="partnerPortalSectionHeader"><p className="eyebrow">Manual calendar</p><h2>Room availability</h2><button type="button" onClick={() => setAvailability((items) => [...items,{id:`new-${items.length}`,propertyId:"",roomId:rooms[0]?.id,date:today,roomsAvailable:null,rate:null,currency:"USD",restrictions:{},provider:"manual",syncStatus:"manual"}])}>Add date</button></div>
    {availability.map((entry,index) => <div className="partnerPortalFormGrid" key={entry.id}><label><span>Room</span><select value={entry.roomId ?? ''} onChange={(event) => setAvailability((items) => items.map((item,i) => i===index ? {...item,roomId:event.target.value} : item))}>{rooms.map((room) => <option value={room.id} key={room.id}>{room.title}</option>)}</select></label><label><span>Date</span><input type="date" value={entry.date} onChange={(event) => setAvailability((items) => items.map((item,i) => i===index ? {...item,date:event.target.value} : item))} /></label><label><span>Rooms available</span><input min="0" type="number" value={entry.roomsAvailable ?? ''} onChange={(event) => setAvailability((items) => items.map((item,i) => i===index ? {...item,roomsAvailable:event.target.value === '' ? null : Number(event.target.value)} : item))} /></label><label><span>Nightly rate</span><input min="0" type="number" value={entry.rate ?? ''} onChange={(event) => setAvailability((items) => items.map((item,i) => i===index ? {...item,rate:event.target.value === '' ? null : Number(event.target.value)} : item))} /></label></div>)}
    <button disabled={pending} type="button" onClick={() => startTransition(async () => setMessage((await savePartnerManualAvailability(availability)).message))}>Save manual availability</button><p role="status">{message}</p></section>
    <section className="partnerPortalPanel"><h2>Arrival and departure schedule</h2>{bookings.length ? bookings.map((booking) => <div key={booking.id}><strong>{booking.arrival} – {booking.departure}</strong><span>{booking.guest.name} · {booking.roomType} · {booking.status}</span></div>) : <p>No bookings are scheduled.</p>}</section></div>;
}
