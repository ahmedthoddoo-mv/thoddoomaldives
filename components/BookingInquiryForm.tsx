"use client";

import { useState } from "react";

export default function BookingInquiryForm() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [roomType, setRoomType] = useState("Deluxe Double Room");
  const [transfer, setTransfer] = useState("Yes");
  const [request, setRequest] = useState("");

  function handleSubmit() {
    const message = `Hi,

I would like to book Thoddoo Sun Sky Inn.

📅 Check-in: ${checkIn}
📅 Check-out: ${checkOut}
👥 Adults: ${adults}
👶 Children: ${children}
🛏 Room Type: ${roomType}
🚤 Need Transfer Help: ${transfer}

Special Request:
${request}

I found you on iThoddoo Maldives.`;

    window.open(
      `https://wa.me/9609910136?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-3xl font-bold">Quick Booking Inquiry</h2>
      <p className="mt-2 text-slate-600">
        Fill this form and send your booking request directly on WhatsApp.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-semibold">Check-in</span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="rounded-xl border p-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-semibold">Check-out</span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="rounded-xl border p-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-semibold">Adults</span>
          <input
            type="number"
            min="1"
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            className="rounded-xl border p-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-semibold">Children</span>
          <input
            type="number"
            min="0"
            value={children}
            onChange={(e) => setChildren(e.target.value)}
            className="rounded-xl border p-3"
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="font-semibold">Room Type</span>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="rounded-xl border p-3"
          >
            <option>Deluxe Double Room</option>
            <option>Family Room</option>
          </select>
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="font-semibold">Need transfer help?</span>
          <select
            value={transfer}
            onChange={(e) => setTransfer(e.target.value)}
            className="rounded-xl border p-3"
          >
            <option>Yes</option>
            <option>No</option>
            <option>Not sure</option>
          </select>
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="font-semibold">Special Request</span>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="min-h-28 rounded-xl border p-3"
            placeholder="Example: airport arrival time, honeymoon, room preference..."
          />
        </label>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full rounded-full bg-green-500 px-6 py-4 font-semibold text-white"
      >
        Send Inquiry on WhatsApp
      </button>
    </div>
  );
}