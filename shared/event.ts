export type EventDraft = {
  title: string;
  allDay: boolean;
  start: string;
  end: string;
};

export type Event = EventDraft & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
