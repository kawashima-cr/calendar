import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, {
  type DateClickArg,
} from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import type {
  DateSelectArg,
  EventApi,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";
import { IconEdit, IconTrash, IconX } from "@tabler/icons-react";

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

type ErrorMessage = {
  title?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
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

  const [events, setEvents] = useState<EventInput[]>([]);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<ErrorMessage | null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

  const toYmd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const toHm = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  const createDraftFromDate = (date: Date): Draft => {
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

  const eventToDraft = (ev: EventApi): Draft => {
    const start = ev.start ?? new Date();
    const endBase = ev.end ?? start;
    const endForDisplay = ev.allDay
      ? new Date(
          endBase.getFullYear(),
          endBase.getMonth(),
          endBase.getDate() - 1,
        )
      : endBase;

    return {
      title: ev.title,
      allDay: ev.allDay,
      startDate: toYmd(start),
      startTime: ev.startStr.slice(11, 16) || "09:00",
      endDate: toYmd(endForDisplay),
      endTime: ev.endStr.slice(11, 16) || "10:00",
    };
  };

  const validateDraft = (draft: Draft) => {
    const errors: ErrorMessage = {};

    const title = draft.title.trim();
    if (!title) {
      errors.title = "タイトルは必須です。";
    }
    if (!draft.startDate) {
      errors.startDate = "日付を入力してください";
    }
    if (!draft.endDate) {
      errors.endDate = "日付を入力してください";
    }
    if (!draft.allDay) {
      if (!draft.startTime) {
        errors.startTime = "時間を入力してください";
      }
      if (!draft.endTime) {
        errors.endTime = "時間を入力してください";
      }
    }
    if (draft.startDate && draft.endDate) {
      const startDate = parseLocalDateTime(draft.startDate);
      const endDate = parseLocalDateTime(draft.endDate);
      if (endDate < startDate) {
        errors.endDate = "開始日付以降にしてください";
      } else if (!draft.allDay && draft.startTime && draft.endTime) {
        const startTime = parseLocalDateTime(draft.startDate, draft.startTime);
        const endTime = parseLocalDateTime(draft.endDate, draft.endTime);
        if (endTime <= startTime) {
          errors.endTime = "開始時間以降にしてください";
        }
      }
    }

    return errors;
  };

  const createDraftFromRange = (
    start: Date,
    end: Date,
    allDay: boolean,
  ): Draft => {
    const endForDisplay = allDay ? addDays(end, -1) : end;

    return {
      title: "",
      allDay,
      startDate: toYmd(start),
      startTime: allDay ? "09:00" : toHm(start),
      endDate: toYmd(endForDisplay),
      endTime: allDay ? "10:00" : toHm(endForDisplay),
    };
  };

  const closeAll = () => {
    setIsModalOpen(false);
    setDetailModal(false);
    setIsEditing(false);
    setSelectedEventId(null);
    setDraft(initialDraft);
    setFormError(null);
  };

  const handleDateClick = (arg: DateClickArg) => {
    setDraft(createDraftFromDate(arg.date));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validateDraft(draft);
    if (Object.keys(errors).length) {
      setFormError(errors);
      return;
    }
    setFormError(null);

    if (isEditing && !selectedEventId) {
      setFormError({ title: "編集対象が選択されていません。" });
      return;
    }

    if (isEditing && selectedEventId) {
      const editEvent = { ...draftToEvent(draft), id: selectedEventId };
      setEvents((prev) =>
        prev.map((e) => (e.id === selectedEventId ? editEvent : e)),
      );
      closeAll();
      return;
    }

    const newEvent = draftToEvent(draft);
    setEvents((prev) => [...prev, newEvent]);
    closeAll();
  };

  const handleCloseModal = () => {
    closeAll();
  };
  const handleCloseDetail = () => {
    setDetailModal(false);
    setSelectedEventId(null);
  };

  const handleEventClick = (info: EventClickArg) => {
    setDraft(eventToDraft(info.event));
    setSelectedEventId(info.event.id);
    setFormError(null);
    setDetailModal(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setDetailModal(false);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedEventId) return;
    setEvents((prev) => prev.filter((e) => e.id !== selectedEventId));
    closeAll();
  };

  const handleSelectRange = (info: DateSelectArg) => {
    setDraft(createDraftFromRange(info.start, info.end, info.allDay));
    setIsModalOpen(true);
    setIsEditing(false);
    setSelectedEventId(null);
    setFormError(null);

    info.view.calendar.unselect();
  };

  const title = isEditing ? "EDIT" : "NEW EVENT";
  const submit = isEditing ? "更新" : "保存";

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
          eventClick={handleEventClick}
          select={handleSelectRange}
        />
      </div>

      {/* 新規登録 / 編集 モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-8 backdrop-blur-xs">
          <div className="w-full max-w-sm border-3 border-black bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                type="button"
                className="p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 hover:rotate-90"
              >
                <IconX stroke={2} className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <label className="block text-sm font-medium text-zinc-800 text-left">
                タイトル
                <div className="h-4 mb-1">
                  {formError?.title && (
                    <p className="text-xs text-red-500 text-left">
                      {formError.title}
                    </p>
                  )}
                </div>
                <input
                  type="text"
                  name="title"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((draft) => ({ ...draft, title: e.target.value }))
                  }
                  placeholder="例: 打ち合わせ"
                  className="w-full border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
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
                  <div className="h-4 mb-1">
                    {formError?.startDate && (
                      <p className="mb-1 text-xs text-red-500 text-left">
                        {formError.startDate}
                      </p>
                    )}
                  </div>
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
                    className="w-full border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </label>
                {!draft.allDay && (
                  <label className="text-left block text-sm font-medium text-zinc-800">
                    開始時間
                    <div className="h-4 mb-1">
                      {formError?.startTime && (
                        <p className="mb-1 text-xs text-red-500 text-left">
                          {formError.startTime}
                        </p>
                      )}
                    </div>
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
                      className="w-full h-9.5 border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-left block text-sm font-medium text-zinc-800">
                  終了日付
                  <div className="h-4 mb-1">
                    {formError?.endDate && (
                      <p className="mb-1 text-xs text-red-500 text-left">
                        {formError.endDate}
                      </p>
                    )}
                  </div>
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
                    className="w-full border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </label>
                {!draft.allDay && (
                  <label className="text-left block text-sm font-medium text-zinc-800">
                    終了時間
                    <div className="h-4 mb-1">
                      {formError?.endTime && (
                        <p className="mb-1 text-xs text-red-500 text-left">
                          {formError.endTime}
                        </p>
                      )}
                    </div>
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
                      className="w-full h-9.5 border border-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-black focus:ring-2 focus:ring-black/10"
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
                  {submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 詳細モーダル */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-8 backdrop-blur-xs">
          <div className="w-full max-w-sm border-3 border-black bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold text-zinc-900">DERAIL</h2>
                <div className="flex gap-2 justify-end">
                  <IconEdit
                    className="text-zinc-600 cursor-pointer hover:text-zinc-500"
                    onClick={handleEdit}
                  />
                  <IconTrash
                    className="text-zinc-600 cursor-pointer hover:text-zinc-500"
                    onClick={handleDelete}
                  />
                  <IconX
                    className="text-zinc-600 cursor-pointer hover:text-zinc-500"
                    onClick={handleCloseDetail}
                  />
                </div>
              </div>
              <div className="text-3xl text-left text-zinc-800 mt-5">
                {draft.title}
              </div>
              <div className="text-md text-left text-zinc-600 mt-2">
                {draft.allDay ? (
                  <div>
                    {draft.startDate} ～ {draft.endDate}（終日）
                  </div>
                ) : (
                  <div>
                    {draft.startDate} / {draft.startTime} ～ {draft.endDate} /{" "}
                    {draft.endTime}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
