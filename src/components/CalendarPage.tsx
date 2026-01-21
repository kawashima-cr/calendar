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
import { IconX } from "@tabler/icons-react";

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
    const endDate = startDate;

    return {
      title: "",
      allDay: true,
      startDate,
      startTime: "09:00",
      endDate,
      endTime: "10:00",
    };
  };

  const parseLocalDateTime = (ymd: string, hm = "00:00") => {
    const [y, m, d] = ymd.split("-").map(Number);
    const [hh, mm] = hm.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0);
  };

  const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const draftToEvent = (draft: Draft): EventInput => {
    const start = draft.allDay
      ? parseLocalDateTime(draft.startDate)
      : parseLocalDateTime(draft.startDate, draft.startTime);

    const endBase = draft.allDay
      ? parseLocalDateTime(draft.endDate)
      : parseLocalDateTime(draft.endDate, draft.endTime);

    const end = draft.allDay ? addDays(endBase, 1) : endBase;

    return {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      start,
      end,
      allDay: draft.allDay,
    };
  };

  const handleDateClick = (arg: DateClickArg) => {
    setDraft(createDraftFromDate(arg.date));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    const newEvent = draftToEvent(draft);
    setEvents((prev) => [...prev, newEvent]);
    setIsModalOpen(false);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-8 backdrop-blur-xs">
          <div className="w-full max-w-sm border-3 border-black bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  NEW EVENT
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                type="button"
                className="p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 hover:rotate-90"
              >
                <IconX stroke={2} className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <label className="block text-sm font-medium text-zinc-800 text-left">
                タイトル
                <input
                  type="text"
                  name="title"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((draft) => ({ ...draft, title: e.target.value }))
                  }
                  placeholder="例: 打ち合わせ"
                  className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </label>

              <label className="w-max flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-800">
                終日
                <input
                  type="checkbox"
                  name="allDay"
                  checked={draft.allDay}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, allDay: e.target.checked }))
                  }
                  className="h-4 w-4 accent-black"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-left block text-sm font-medium text-zinc-800">
                  開始日付
                  <input
                    type="date"
                    name="startDate"
                    value={draft.startDate}
                    onChange={(e) =>
                      setDraft((draft) => ({
                        ...draft,
                        startDate: e.target.value,
                      }))
                    }
                    className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </label>
                {!draft.allDay && (
                  <label className="text-left block text-sm font-medium text-zinc-800">
                    開始時間
                    <input
                      type="time"
                      name="startTime"
                      value={draft.startTime}
                      onChange={(e) =>
                        setDraft((draft) => ({
                          ...draft,
                          startTime: e.target.value,
                        }))
                      }
                      className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-left block text-sm font-medium text-zinc-800">
                  終了日付
                  <input
                    type="date"
                    name="endDate"
                    value={draft.endDate}
                    onChange={(e) =>
                      setDraft((draft) => ({
                        ...draft,
                        endDate: e.target.value,
                      }))
                    }
                    className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </label>
                {!draft.allDay && (
                  <label className="text-left block text-sm font-medium text-zinc-800">
                    終了時間
                    <input
                      type="time"
                      name="endTime"
                      value={draft.endTime}
                      onChange={(e) =>
                        setDraft((draft) => ({
                          ...draft,
                          endTime: e.target.value,
                        }))
                      }
                      className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="border-2 border-black px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="border-2 border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
