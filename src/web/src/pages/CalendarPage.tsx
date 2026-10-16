import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { CalendarItem, Parish } from "../types";

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

export default function CalendarPage() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [parishId, setParishId] = useState<number | "all">("all");
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [cursor, setCursor] = useState(() => new Date());

  useEffect(() => {
    api<Parish[]>("/api/parishes").then((items) => {
      setParishes(items);
      if (items[0]) {
        setParishId(items[0].id);
      }
    });
  }, []);

  useEffect(() => {
    const query = parishId === "all" ? "/api/calendar" : `/api/calendar?parishId=${parishId}`;
    api<CalendarItem[]>(query).then(setEvents);
  }, [parishId]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const items: { date: Date; current: boolean }[] = [];
    for (let i = 0; i < startOffset; i += 1) {
      items.push({ date: new Date(year, month, i - startOffset + 1), current: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      items.push({ date: new Date(year, month, day), current: true });
    }
    while (items.length % 7 !== 0) {
      const last = items[items.length - 1].date;
      items.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), current: false });
    }
    return items;
  }, [cursor]);

  const title = cursor.toLocaleDateString("fr", { month: "long", year: "numeric" });

  return (
    <>
      <h1>Calendrier par paroisse</h1>
      <div className="filters">
        {parishes.map((parish) => (
          <button
            key={parish.id}
            className={parishId === parish.id ? "active" : ""}
            onClick={() => setParishId(parish.id)}
          >
            {parish.name}
          </button>
        ))}
        <button className={parishId === "all" ? "active" : ""} onClick={() => setParishId("all")}>
          Toutes
        </button>
      </div>
      <p>
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>←</button>{" "}
        <strong style={{ textTransform: "capitalize" }}>{title}</strong>{" "}
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>→</button>
      </p>
      <div className="calendar">
        {weekDays.map((day) => (
          <div key={day} className="dow">
            {day}
          </div>
        ))}
        {cells.map((cell) => {
          const key = [
            cell.date.getFullYear(),
            String(cell.date.getMonth() + 1).padStart(2, "0"),
            String(cell.date.getDate()).padStart(2, "0")
          ].join("-");
          const dayEvents = events.filter((event) => event.startsAt.slice(0, 10) === key);
          return (
            <div key={`${key}-${cell.current}`} className={`day${cell.current ? "" : " muted"}`}>
              <strong>{cell.date.getDate()}</strong>
              {dayEvents.map((event) => (
                <span key={event.id} className="event-chip" title={event.title}>
                  {event.title}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
