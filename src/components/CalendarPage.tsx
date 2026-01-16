import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";

function getYearMonth(date: Date) {
  const year = new Intl.DateTimeFormat("ja-JP", { year: "numeric" }).format(
    date
  );
  // "1月" を作りたいので month: "numeric" + "月" のほうが確実
  const monthNum = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
  }).format(date);
  const month = `${monthNum}`;
  return { year, month };
}

export default function CalendarPage() {
  const calRef = useRef<FullCalendar | null>(null);
  const api = () => calRef.current?.getApi();

  // 表示中の月を表す基準日
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const { year, month } = useMemo(() => getYearMonth(anchorDate), [anchorDate]);

  return (
    <div className="">
      {/* 自作ヘッダー */}
      <div className="">
        <div className="grid grid-cols-9 items-stretch border-2 divide-x-2">
          {/* 左端: 年（小） + 月（大） */}
          <div className="col-span-2 py-4 flex items-center justify-center">
            <span className="text-xl tabular-nums">{year}</span>
          </div>
          <div className="col-span-4 py-4 flex items-center justify-center">
            <span className="text-4xl font-semibold tabular-nums">{month}</span>
          </div>

          {/* 右側: ナビ・ビュー切替（お好みで） */}
          <div className="col-span-1 py-4 flex items-center justify-center">
            <button
              className="rounded-md px-3 py-1 text-lg font-semibold"
              onClick={() => api()?.prev()}
              type="button"
            >
              ←
            </button>
          </div>
          <div className="col-span-1 py-4 flex items-center justify-center">
            <button
              className="rounded-md px-3 py-1 text-md font-semibold"
              onClick={() => api()?.today()}
              type="button"
            >
              TODAY
            </button>
          </div>
          <div className="col-span-1 py-4 flex items-center justify-center">
            <button
              className="rounded-md px-3 py-1 text-lg font-semibold"
              onClick={() => api()?.next()}
              type="button"
            >
              →
            </button>
          </div>

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
          dayMaxEvents={true}
          selectable
          editable
          // 表示範囲が変わるたびに呼ばれるので、ここで年/月を更新
          datesSet={(arg) => {
            // 月ビューは currentStart が「その月の先頭」になるので基準日にしやすい
            setAnchorDate(arg.view.currentStart);
          }}
        />
      </div>
    </div>
  );
}
