import { useMemo, useState } from "react";

type Props = {
  /** 初期表示（省略時は今月） */
  initialDate?: Date;
  /** 週の開始曜日: 0=日, 1=月 */
  weekStartsOn?: 0 | 1;
  /** 日付クリック時 */
  onSelectDate?: (date: Date) => void;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, months: number) {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function clampToNoon(d: Date) {
  // DST/タイムゾーンのズレ事故を避けるため “正午固定” で扱う（地味に効く）
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

export function SimpleMonthCalendar({
  initialDate = new Date(),
  weekStartsOn = 0,
  onSelectDate,
}: Props) {
  const [cursor, setCursor] = useState(() => clampToNoon(initialDate));
  const [selected, setSelected] = useState<Date | null>(null);

  const today = useMemo(() => clampToNoon(new Date()), []);

  const { title, weeks } = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);

    const year = monthStart.getFullYear();
    const month = monthStart.getMonth(); // 0-11

    // 表示開始日（その月の1日が属する週の先頭へ）
    const firstDow = monthStart.getDay(); // 0=Sun
    const offset = (firstDow - weekStartsOn + 7) % 7;
    const gridStart = new Date(year, month, 1 - offset, 12);

    // 表示終了日（6週固定にしたいので 42日ぶん）
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(
        new Date(
          gridStart.getFullYear(),
          gridStart.getMonth(),
          gridStart.getDate() + i,
          12
        )
      );
    }

    // 7日×6週に分割
    const w: Date[][] = [];
    for (let i = 0; i < 6; i++) {
      w.push(days.slice(i * 7, i * 7 + 7));
    }

    const monthLabel = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
    }).format(monthStart);

    return { title: monthLabel, weeks: w };
  }, [cursor, weekStartsOn]);

  const weekLabels = useMemo(() => {
    const labelsSun = ["日", "月", "火", "水", "木", "金", "土"];
    if (weekStartsOn === 0) return labelsSun;
    return [...labelsSun.slice(1), labelsSun[0]]; // 月始まり
  }, [weekStartsOn]);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);

  return (
    <div className="w-full max-w-md rounded-xl border bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-lg font-semibold">{title}</div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => setCursor((d) => addMonths(d, -1))}
          >
            前月
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => setCursor(() => clampToNoon(new Date()))}
          >
            今月
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => setCursor((d) => addMonths(d, 1))}
          >
            次月
          </button>
        </div>
      </div>

      {/* Week labels */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-500">
        {weekLabels.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date) => {
          const inMonth = date >= monthStart && date <= monthEnd;
          const isToday = isSameDay(date, today);
          const isSelected = selected ? isSameDay(date, selected) : false;

          const dow = date.getDay();
          const isSun = dow === 0;
          const isSat = dow === 6;

          const base =
            "aspect-square rounded-md text-sm flex items-center justify-center select-none border";
          const muted = inMonth
            ? "bg-white"
            : "bg-gray-50 text-gray-400 border-transparent";
          const weekend = inMonth
            ? isSun
              ? "text-red-600"
              : isSat
                ? "text-blue-600"
                : "text-gray-900"
            : "";
          const ring = isSelected ? "ring-2 ring-black" : "";
          const todayMark = isToday ? "font-bold" : "";

          return (
            <button
              key={date.toISOString()}
              type="button"
              className={[base, muted, weekend, ring, todayMark]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (!inMonth) return;
                setSelected(date);
                onSelectDate?.(date);
              }}
              aria-label={new Intl.DateTimeFormat("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
