import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, {
  type DateClickArg,
} from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import type { EventInput } from "@fullcalendar/core";

function getYearMonth(date: Date) {
  const year = new Intl.DateTimeFormat("ja-JP", { year: "numeric" }).format(
    date
  );
  const month = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
  }).format(date);
  return { year, month };
}

export default function CalendarPage() {
  // FullCalendarを外から操作するためのref
  const calRef = useRef<FullCalendar | null>(null);
  const api = () => calRef.current?.getApi();

  // ヘッダーの年/月表示用（「今表示してる月」を表す基準日）
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const { year, month } = useMemo(() => getYearMonth(anchorDate), [anchorDate]);

  const [events, setEvents] = useState<EventInput[]>([]);

  const syncAnchorDateFromCalendar = () => {
    const d = api()?.getDate(); // FullCalendarが“今”持っている日付（基準日）を取得
    if (d) setAnchorDate(d); // それをヘッダー表示用のstateに反映
  };

  const handleDateClick = (arg: DateClickArg) => {
    const title = prompt("予定タイトル", "新規予定");
    // TODOエラーの実装
    if (!title) return;

    const start = arg.date;
    const end = arg.allDay
      ? undefined
      : new Date(start.getTime() + 30 * 60 * 1000);
    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        start,
        end,
        allDay: arg.allDay,
      },
    ]);
  };

  return (
    <div className="">
      {/* 自作ヘッダー */}
      <div className="">
        <div className="grid grid-cols-9 items-stretch border-2 divide-x-2 ">
          {/* 左端: 年（小） + 月（大） */}
          <div className="col-span-2 py-4 flex items-center justify-center">
            <span className="text-xl tabular-nums">{year}</span>
          </div>
          <div className="col-span-4 py-4 flex items-center justify-center">
            <span className="text-4xl font-semibold tabular-nums">{month}</span>
          </div>

          {/* 右側: ナビ・ビュー切替（お好みで） */}
          <button
            className="col-span-1 py-4 flex items-center justify-center hover:bg-gray-50"
            onClick={() => api()?.prev()}
            type="button"
          >
            <span className="rounded-md px-3 py-1 text-lg font-semibold">
              ←
            </span>
          </button>
          <button
            className="col-span-1 py-4 flex items-center justify-center hover:bg-gray-50"
            onClick={() => api()?.today()}
            type="button"
          >
            <span className="rounded-md px-3 py-1 text-md font-semibold">
              TODAY
            </span>
          </button>
          <button
            className="col-span-1 py-4 flex items-center justify-center hover:bg-gray-50"
            onClick={() => api()?.next()}
            type="button"
          >
            <span className="rounded-md px-3 py-1 text-lg font-semibold">
              →
            </span>
          </button>

          {/* <div className="ml-2 h-6 w-px bg-gray-200" />

            <button
              className="rounded-md border-2 px-3 py-1 text-sm"
              onClick={() => api()?.changeView("dayGridMonth")}
              type="button"
            >
              Month
            </button>
            <button
              className="rounded-md border-2 px-3 py-1 text-sm"
              onClick={() => api()?.changeView("timeGridWeek")}
              type="button"
            >
              Week
            </button>
            <button
              className="rounded-md border-2 px-3 py-1 text-sm"
              onClick={() => api()?.changeView("timeGridDay")}
              type="button"
            >
              Day
            </button>
          </div> */}
        </div>
      </div>

      {/* カレンダー本体 */}
      <div className="h-[calc(100vh-120px)]">
        <FullCalendar
          ref={calRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
            rrulePlugin,
          ]}
          headerToolbar={false}
          height="100%"
          initialView="dayGridMonth"
          dayMaxEvents
          nowIndicator
          selectable
          editable
          unselectAuto
          dateClick={handleDateClick}
          events={events}
          eventClick={(info) => {
            // デモ: クリックで削除（任意）
            const ok = window.confirm(`削除しますか？: ${info.event.title}`);
            if (!ok) return;
            const id = info.event.id;
            setEvents((prev) => prev.filter((e) => e.id !== id));
          }}
        />
      </div>
    </div>
  );
}
