import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";

import jaLocale from "@fullcalendar/core/locales/ja"; // 日本語化（ESMで特定ロケールを読む例）:contentReference[oaicite:2]{index=2}

export function Calendar() {
  return (
    <div className="h-[calc(100vh-80px)]">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          listPlugin,
          interactionPlugin,
          rrulePlugin,
        ]}
        initialView="dayGridMonth"
        locale={jaLocale}
        // headerToolbar={{
        //   left: "prev,today,next",
        //   center: "title",
        //   right: "dayGridMonth,listWeek",
        // }}
        height="100%"
        dayMaxEvents={true}
        selectable
        editable
        nowIndicator
        dayCellContent={(arg) => <span>{arg.date.getDate()}</span>}
        events={[
          {
            title: "毎週月曜 9:00",
            rrule: {
              freq: "weekly",
              byweekday: ["mo"],
              dtstart: "2026-01-05T09:00:00",
            },
            duration: "01:00",
          },
          {
            id: "1",
            title: "打合せ",
            start: "2026-01-15T10:00:00",
            end: "2026-01-15T11:00:00",
          },
          { id: "2", title: "終日イベント", start: "2026-01-16", allDay: true },
        ]}
        // eventClassNames={() => [
        //   "rounded-md",
        //   "px-2",
        //   "py-1",
        //   "text-xs",
        //   "font-medium",
        //   "shadow-sm",
        // ]}
        // eventContent={(info) => (
        //   <div className="flex items-center gap-1">
        //     <span className="font-semibold">{info.timeText}</span>
        //     <span className="truncate">{info.event.title}</span>
        //   </div>
        // )}
      />
    </div>
  );
}
