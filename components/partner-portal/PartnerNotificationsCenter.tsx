"use client";

import { useState, useTransition } from "react";
import { markPartnerNotificationRead } from "@/app/partner/actions";
import type { PartnerPortalNotification } from "@/lib/partner-portal/partnerAccess";

export function PartnerNotificationsCenter({ notifications }: { notifications: PartnerPortalNotification[] }) {
  const [items, setItems] = useState(notifications);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      const result = await markPartnerNotificationRead(id);
      setMessage(result.message);
      if (result.ok) {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "read" } : item)));
      }
    });
  }

  return (
    <section className="partnerPortalPanel">
      <div className="partnerPortalSectionHeader">
        <p className="eyebrow">Notifications</p>
        <h2>Notification Center</h2>
      </div>
      <div className="partnerPortalBookingList">
        {items.map((notification) => (
          <article key={notification.id}>
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.body}</p>
              <small>{notification.type} | {notification.createdAt}</small>
            </div>
            <span>{notification.status}</span>
            <button disabled={isPending || notification.status === "read"} onClick={() => markRead(notification.id)} type="button">
              Mark read
            </button>
          </article>
        ))}
      </div>
      {message ? <p className="propertySaveStatus propertySaveStatusSuccess">{message}</p> : null}
    </section>
  );
}
