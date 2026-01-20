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

type Draft = {
  title: string;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

const initialDraft: Draft = {
  title: "",
  allDay: true,
  startDate: "",
  startTime: "09:00",
  endDate: "",
  endTime: "10:00",
};

function getYearMonth(date: Date) {
  const year = new Intl.DateTimeFormat("ja-JP", { year: "numeric" }).format(
    date,
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [events, setEvents] = useState<EventInput[]>([]);

  const createDraftFromDate = (date: Date): Draft => {
    const toYmd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const startDate = toYmd(date);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const endDate = toYmd(next);

    return {
      title: "",
      allDay: true,
      startDate,
      startTime: "09:00",
      endDate,
      endTime: "10:00",
    };
  };

  const handleDateClick = (arg: DateClickArg) => {
    setDraft(createDraftFromDate(arg.date));
    setIsModalOpen(true);

    setEvents((prev) => [...prev]);
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
          datesSet={(info) => {
            setAnchorDate(info.view.currentStart);
          }}
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
      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed bg-zinc-50 h-100 w-70 px-4 py-5 z-20 rounded-xs border-4 top-[30%] left-[50%] shadow-lg">
          <form action="">
            <label>
              タイトル
              <input
                type="text"
                name="title"
                value={draft.title}
                onChange={(e) =>
                  setDraft((draft) => ({ ...draft, title: e.target.value }))
                }
              />
            </label>
            <label>
              終日
              <input
                type="checkbox"
                name="allDay"
                checked={draft.allDay}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, allDay: e.target.checked }))
                }
              />
            </label>
            <label>
              開始日付
              <input
                type="text"
                name="startDate"
                value={draft.startDate}
                onChange={(e) =>
                  setDraft((draft) => ({ ...draft, startDate: e.target.value }))
                }
              />
            </label>
            <label>
              開始時間
              <input
                type="text"
                name="startTime"
                value={draft.startTime}
                onChange={(e) =>
                  setDraft((draft) => ({ ...draft, startTime: e.target.value }))
                }
              />
            </label>
            <label>
              終了日付
              <input
                type="text"
                name="endDate"
                value={draft.endDate}
                onChange={(e) =>
                  setDraft((draft) => ({ ...draft, endDate: e.target.value }))
                }
              />
            </label>
            <label>
              終了時間
              <input
                type="text"
                name="endTime"
                value={draft.endTime}
                onChange={(e) =>
                  setDraft((draft) => ({ ...draft, endTime: e.target.value }))
                }
              />
            </label>

            <button type="submit" onClick={() => console.log("!")}></button>
          </form>
        </div>
      )}
    </div>
  );
}
