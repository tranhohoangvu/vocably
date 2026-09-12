const MONTHS = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

export function HeatmapCalendar({ history }: { history: string[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const active = new Set(history);

  const days: { dateStr: string; on: boolean; isToday: boolean }[] = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    days.push({ dateStr: ds, on: active.has(ds), isToday: ds === today });
  }

  const monthMarkers: string[] = [];
  for (let m = 11; m >= 0; m--) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    monthMarkers.push(MONTHS[d.getMonth()]);
  }

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        <div className="flex w-6 shrink-0 flex-col justify-between py-6 text-xs font-medium text-subtle">
          <span>T2</span>
          <span>T4</span>
          <span>T6</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 grid grid-cols-12 text-xs font-medium text-subtle">
            {monthMarkers.map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
          <div
            className="grid grid-flow-col grid-rows-7 gap-1"
            style={{ gridAutoColumns: "minmax(10px, 1fr)" }}
          >
            {days.map((d) => (
              <div
                key={d.dateStr}
                title={`${d.dateStr}: ${d.on ? "Đã học" : "Chưa học"}`}
                className={`heatmap-cell ${d.on ? "lv3" : ""} ${d.isToday ? "is-today" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-subtle">
        <span>Ít</span>
        <div className="heatmap-cell !size-2.5" />
        <div className="heatmap-cell lv1 !size-2.5" />
        <div className="heatmap-cell lv2 !size-2.5" />
        <div className="heatmap-cell lv3 !size-2.5" />
        <span>Nhiều</span>
      </div>
    </div>
  );
}

export function StreakWeekTrack({ studyHistory }: { studyHistory: string[] }) {
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeek);

  return (
    <div className="mt-5 flex justify-between rounded-[var(--radius-md)] bg-bg px-3 py-3">
      {daysOfWeek.map((label, idx) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + idx);
        const ds = d.toISOString().slice(0, 10);
        const done = studyHistory.includes(ds);
        const isToday = idx === currentDayOfWeek;
        return (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-subtle"}`}>
              {label}
            </span>
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                done ? "bg-primary text-primary-fg" : "bg-bg-subtle text-subtle"
              }`}
            >
              {done ? "✓" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
