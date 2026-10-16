export type PostType = "News" | "Event" | "Document";

export type Parish = {
  id: number;
  name: string;
  slug: string;
  patron: string;
  address: string;
  massSchedule: string;
  description: string;
  accentColor: string;
};

export type Post = {
  id: number;
  parishId: number | null;
  parish?: Parish | null;
  type: PostType;
  title: string;
  slug: string;
  body: string;
  publishedAt: string;
  eventStartsAt?: string | null;
  coverImagePath?: string | null;
  attachmentPath?: string | null;
  attachmentName?: string | null;
};

export type PhotoAlbum = {
  id: number;
  parishId: number | null;
  parish?: Parish | null;
  name: string;
  description?: string | null;
  createdAt: string;
};

export type Photo = {
  id: number;
  parishId: number | null;
  parish?: Parish | null;
  albumId?: number | null;
  album?: PhotoAlbum | null;
  title: string;
  caption: string;
  filePath: string;
  takenAt: string;
};

export type CalendarItem = {
  id: number;
  parishId: number;
  parish?: Parish;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt?: string | null;
  allDay: boolean;
};
