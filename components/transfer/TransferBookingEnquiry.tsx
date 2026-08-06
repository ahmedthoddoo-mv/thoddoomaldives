"use client";

import { useMemo, useState } from "react";
import { generateTransferLink } from "@/lib/whatsapp";
import { buildTransferEnquiryMessage } from "@/components/transfer/transfer-utils";
import { TransferIcon } from "@/components/transfer/TransferIcon";

function openWhatsApp(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function TransferBookingEnquiry({
  companyName,
  defaultFrom,
  defaultTo,
  whatsappHref,
}: {
  companyName: string;
  defaultFrom: string;
  defaultTo: string;
  whatsappHref: string;
}) {
  const [journeyType, setJourneyType] = useState<"one-way" | "return">("one-way");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [travelDate, setTravelDate] = useState("");
  const [passengers, setPassengers] = useState("2");

  const enquiryUrl = useMemo(() => {
    const url = new URL(generateTransferLink({ transfer: companyName }));
    url.searchParams.set(
      "text",
      buildTransferEnquiryMessage({
        companyName,
        values: {
          journeyType,
          from,
          to,
          travelDate: travelDate || "Not set",
          passengers: Number(passengers) || 1,
        },
      })
    );
    return url.toString();
  }, [companyName, from, journeyType, passengers, to, travelDate]);

  return (
    <aside className="platformCard transferBookingPanel" id="booking-enquiry" aria-label="Booking enquiry">
      <div className="platformCardBody">
        <p className="eyebrow">Booking enquiry</p>
        <h2>Check availability</h2>
        <p className="transferBookingIntro">
          Request a departure on WhatsApp. This form does not claim online confirmation or payment.
        </p>

        <form
          className="transferBookingForm"
          onSubmit={(event) => {
            event.preventDefault();
            openWhatsApp(enquiryUrl);
          }}
        >
          <fieldset className="transferBookingFieldset">
            <legend>Journey type</legend>
            <div className="transferBookingChoices" role="radiogroup" aria-label="Journey type">
              <label className="transferBookingChoice">
                <input
                  type="radio"
                  name="journeyType"
                  value="one-way"
                  checked={journeyType === "one-way"}
                  onChange={() => setJourneyType("one-way")}
                />
                One way
              </label>
              <label className="transferBookingChoice">
                <input
                  type="radio"
                  name="journeyType"
                  value="return"
                  checked={journeyType === "return"}
                  onChange={() => setJourneyType("return")}
                />
                Return
              </label>
            </div>
          </fieldset>

          <label className="transferBookingField">
            <span>From</span>
            <input type="text" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>

          <label className="transferBookingField">
            <span>To</span>
            <input type="text" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>

          <label className="transferBookingField">
            <span>Travel date</span>
            <input type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} />
          </label>

          <label className="transferBookingField">
            <span>Passengers</span>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
            />
          </label>

          <div className="transferBookingActions">
            <button type="submit" className="platformButton">
              Check availability
            </button>
            <a className="transferBookingLink" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <TransferIcon name="whatsapp" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </form>

        <p className="transferBookingHelper">
          WhatsApp will open with a prefilled request so the operator can confirm the live schedule and baggage guidance.
        </p>
      </div>
    </aside>
  );
}
