import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import jaLocale from "@fullcalendar/core/locales/ja"; // 日本語化（ESMで特定ロケールを読む例）:contentReference[oaicite:2]{index=2}

export function Calendar() {
  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={jaLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        height="auto"
        selectable
        editable
        nowIndicator
        events={[
          {
            id: "1",
            title: "打合せ",
            start: "2026-01-15T10:00:00",
            end: "2026-01-15T11:00:00",
          },
          { id: "2", title: "終日イベント", start: "2026-01-16", allDay: true },
        ]}
      />
    </div>
  );
}
