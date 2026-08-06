import { TransferIcon } from "@/components/transfer/TransferIcon";
import type { TransferDirectionGroup, TransferScheduleExceptionItem } from "@/components/transfer/transfer-utils";
import { formatTransferTime } from "@/components/transfer/transfer-utils";
import { weeklyTimetable } from "@/lib/transfers/schedule";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatExceptionLabel(exception: TransferScheduleExceptionItem) {
  if (exception.cancelled) {
    return `${exception.date} — cancelled`;
  }

  if (exception.departureTime) {
    return `${exception.date} — ${exception.departureTime.slice(0, 5)}`;
  }

  return `${exception.date}${exception.notice ? ` — ${exception.notice}` : ""}`;
}

function matchesDirection(direction: TransferDirectionGroup, exception: TransferScheduleExceptionItem) {
  return direction.schedules.some((schedule) => {
    const scheduleDirection = schedule.direction.trim() || `${schedule.departurePoint} → ${schedule.arrivalPoint}`;
    return (
      (scheduleDirection === exception.direction || schedule.direction === exception.direction) &&
      `${schedule.departurePoint} → ${schedule.arrivalPoint}` === exception.routeLabel
    );
  });
}

function exceptionsForDirection(direction: TransferDirectionGroup, exceptions: TransferScheduleExceptionItem[]) {
  return exceptions.filter((exception) => matchesDirection(direction, exception));
}

export function TransferScheduleSection({
  title,
  directions,
  exceptions,
  nextDepartureLabel,
  nextDepartureNotice,
  fridayNote,
}: {
  title: string;
  directions: TransferDirectionGroup[];
  exceptions: TransferScheduleExceptionItem[];
  nextDepartureLabel: string;
  nextDepartureNotice?: string;
  fridayNote: string;
}) {
  return (
    <section className="platformSection platformSectionMuted" id="schedule">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">Weekly timetable</p>
          <h2>{title}</h2>
          <p>{fridayNote}</p>
        </div>

        <article className="platformNotice transferInfoPanel transferScheduleSummary">
          <p>
            <strong>Next live departure:</strong> {nextDepartureLabel}
          </p>
          {nextDepartureNotice ? <p className="transferScheduleAlert">{nextDepartureNotice}</p> : null}
        </article>

        <nav className="platformPillRow" aria-label="Transfer directions">
          {directions.map((direction) => (
            <a
              className="platformPill"
              href={`#${direction.direction.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              key={direction.direction}
            >
              {direction.direction}
            </a>
          ))}
        </nav>

        {directions.map((direction) => {
          const directionExceptions = exceptionsForDirection(direction, exceptions);

          return (
            <section
              id={direction.direction.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              key={direction.direction}
              className="platformCard transferScheduleSection transferTimetableCard"
            >
              <div className="platformCardBody">
                <div className="transferDirectionHeader">
                  <div>
                    <h3>{direction.direction}</h3>
                    <p>{direction.routeLabel}</p>
                  </div>
                  <p>{direction.schedules.length} published schedule row{direction.schedules.length === 1 ? "" : "s"}</p>
                </div>

                <div className="transferTimetable">
                  {weeklyTimetable(direction.schedules).map(({ day, departures }) => (
                    <div key={day} className={day === 5 ? "transferTimetableRow transferTimetableFriday" : "transferTimetableRow"}>
                      <strong>
                        {DAY_NAMES[day]}
                        {day === 5 ? <span className="transferFridayTag">Friday replacement</span> : null}
                      </strong>
                      <span className="transferTimetableTimes">
                        {departures.length > 0
                          ? departures.map((item) => (
                              <span
                                key={`${day}-${item.direction}-${item.departureTime}`}
                                className={item.fridaySpecific ? "transferTimetableTime transferTimetableTimeFriday" : "transferTimetableTime"}
                              >
                                {formatTransferTime(item.departureTime)}
                              </span>
                            ))
                          : "No scheduled departure"}
                      </span>
                    </div>
                  ))}
                </div>

                {directionExceptions.length > 0 ? (
                  <div className="transferScheduleExceptions">
                    <h4>Exceptions and cancellations</h4>
                    <ul>
                      {directionExceptions.map((exception) => (
                        <li key={`${exception.date}-${exception.direction}-${exception.notice ?? "note"}`}>
                          <TransferIcon name={exception.cancelled ? "shield" : "calendar"} />
                          <span>{formatExceptionLabel(exception)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
