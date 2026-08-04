"use client";

import { useMemo, useState } from "react";
import { buildTransferWhatsAppMessage, validateTransferEnquiry } from "@/lib/transfer";
import type { Transfer, TransferEnquiryInput } from "@/types/transfer";

export function TransferEnquiryWidget({ transfer, compact = false }: { transfer: Transfer; compact?: boolean }) {
  const [tripType, setTripType] = useState<TransferEnquiryInput["tripType"]>("one-way");
  const [from, setFrom] = useState(transfer.departurePoint);
  const [to, setTo] = useState(transfer.arrivalPoint);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [departurePreference, setDeparturePreference] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [infants, setInfants] = useState("0");
  const [flightNumber, setFlightNumber] = useState("");
  const [flightTime, setFlightTime] = useState("");
  const [guestName, setGuestName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [guesthouse, setGuesthouse] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const input = useMemo<TransferEnquiryInput>(() => ({
    transferTitle: transfer.title,
    operatorName: transfer.operatorName,
    tripType,
    from,
    to,
    departureDate,
    returnDate,
    departurePreference,
    adults: Number(adults) || 0,
    children: Number(children) || 0,
    infants: Number(infants) || 0,
    flightNumber,
    flightTime,
    guestName,
    whatsappNumber,
    guesthouse,
    specialRequests,
  }), [
    adults, children, departureDate, departurePreference, flightNumber, flightTime, from, guestName, guesthouse, infants, returnDate, specialRequests, to, transfer.operatorName, transfer.title, tripType, whatsappNumber,
  ]);

  function handleSubmit() {
    const validationErrors = validateTransferEnquiry(input);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    const message = buildTransferWhatsAppMessage(input);
    window.open(`https://wa.me/9609142538?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className={`transferEnquiryCard${compact ? " transferEnquiryCardCompact" : ""}`.trim()}>
      <div className="transferEnquiryHeader">
        <p className="eyebrow">Booking enquiry</p>
        <h2>{compact ? "Book transfer" : "Plan your Nasru Speed Boat transfer"}</h2>
        <p>Send a clear enquiry on WhatsApp. Final availability is confirmed manually by iThoddoo Maldives or the operator.</p>
      </div>

      {errors.length > 0 ? (
        <div className="transferFormAlert" role="alert">
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="transferFormGrid">
        <label>
          <span>Trip type</span>
          <select value={tripType} onChange={(event) => setTripType(event.target.value as TransferEnquiryInput["tripType"])}>
            <option value="one-way">One way</option>
            <option value="return">Return</option>
          </select>
        </label>
        <label>
          <span>From</span>
          <input value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label>
          <span>To</span>
          <input value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <label>
          <span>Departure date</span>
          <input type="date" value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} />
        </label>
        {tripType === "return" ? (
          <label>
            <span>Return date</span>
            <input type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} />
          </label>
        ) : null}
        <label>
          <span>Departure preference</span>
          <input value={departurePreference} onChange={(event) => setDeparturePreference(event.target.value)} placeholder="Example: 10:15 airport departure" />
        </label>
        <label>
          <span>Adults</span>
          <input type="number" min="1" value={adults} onChange={(event) => setAdults(event.target.value)} />
        </label>
        <label>
          <span>Children</span>
          <input type="number" min="0" value={children} onChange={(event) => setChildren(event.target.value)} />
        </label>
        <label>
          <span>Infants</span>
          <input type="number" min="0" value={infants} onChange={(event) => setInfants(event.target.value)} />
        </label>
        <label>
          <span>Flight number</span>
          <input value={flightNumber} onChange={(event) => setFlightNumber(event.target.value)} />
        </label>
        <label>
          <span>Flight arrival or departure time</span>
          <input value={flightTime} onChange={(event) => setFlightTime(event.target.value)} placeholder="Example: 09:40 arrival" />
        </label>
        <label>
          <span>Guest name</span>
          <input value={guestName} onChange={(event) => setGuestName(event.target.value)} />
        </label>
        <label>
          <span>WhatsApp number</span>
          <input value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} />
        </label>
        <label>
          <span>Guesthouse or hotel</span>
          <input value={guesthouse} onChange={(event) => setGuesthouse(event.target.value)} />
        </label>
        <label className="transferFormWide">
          <span>Special requests</span>
          <textarea value={specialRequests} onChange={(event) => setSpecialRequests(event.target.value)} placeholder="Arrival notes, oversized baggage, child seat requests, or guesthouse coordination." />
        </label>
      </div>

      <div className="transferEnquiryFooter">
        <p>Availability is confirmed after enquiry. Please wait for schedule and seat confirmation before making payment.</p>
        <button type="button" className="platformButton" onClick={handleSubmit}>
          Send WhatsApp enquiry
        </button>
      </div>
    </section>
  );
}
