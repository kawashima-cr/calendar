import FullCalendar from "@fullcalendar/react";
import "./App.css";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import jaLocale from "@fullcalendar/core/locales/ja"; // 日本語化（ESMで特定ロケールを読む例）:contentReference[oaicite:2]{index=2}
import { Calendar } from "./components/Calendar";

function App() {
  return (
    <>
      <Calendar />
    </>
  );
}

export default App;
