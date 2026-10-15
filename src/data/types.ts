/** The four knowledge corners the brief groups departments into. */
export type Corner = "brand" | "exchange" | "power" | "general";

/** Every functional area in the LC. `general` is not a department, it's the catch-all corner. */
export type Department =
  | "BD"
  | "PM"
  | "MKT"
  | "IM"
  | "TM"
  | "F&L"
  | "oGV"
  | "oGTa"
  | "oGTe"
  | "iGV"
  | "iGT";

/**
 * Rank in the structure. Support departments run VP → manager; exchange departments
 * run VP → team leader → member, because they carry a delivery team.
 */
export type Level = "lcp" | "vp" | "manager" | "tl" | "member";

export type ActivityType =
  | "meeting"
  | "training"
  | "conference"
  | "event"
  | "deadline";

export interface Activity {
  id: string;
  name: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** Last day, for anything running longer than one. Omitted for single-day items. */
  endDate?: string;
  /** 24h local, HH:MM */
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  department: Department | "LC-wide";
  type: ActivityType;
  description: string;
  /** Cover image shown in the hover preview. */
  image: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  /** ISO date */
  postedOn: string;
  /**
   * When the thing itself happens or falls due, if it does. Most announcements are
   * about something coming up, and "in 2 days" is what people need from the list —
   * the posting date only matters once you're reading the detail.
   */
  dueOn?: string;
  author: string;
  /** Who the update is aimed at, e.g. "Whole LC", "EB & MMB", "Members". */
  audience: string;
  urgent: boolean;
  pinned: boolean;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  department: Department | "EB";
  level: Level;
  /** id of the member this person reports to; null for the LCP. */
  reportsTo: string | null;
  email: string;
  phone: string;
  photo: string;
  jobDescription: string[];
}

export type ResourceKind = "document" | "presentation" | "video" | "link";

export interface Resource {
  id: string;
  title: string;
  kind: ResourceKind;
  corner: Corner;
  /** Department tag, or a general-knowledge category. */
  category: string;
  description: string;
  /** ISO date */
  updatedOn: string;
  url: string;
}

export type TemplateCategory =
  | "reporting"
  | "meeting"
  | "exchange"
  | "partnership"
  | "guidelines"
  | "checklists"
  | "financial";

export interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  owner: Department | "LC-wide";
  format: "doc" | "sheet" | "slides" | "pdf" | "form";
  description: string;
  updatedOn: string;
  url: string;
}

/** The kinds of thing the LC actually opens applications for. */
export type OpportunityKind =
  | "lst"
  | "est"
  | "event-oc"
  | "conference-oc"
  | "uba"
  | "other";

/** Who is eligible — the thing that decides whether an opening is yours to take. */
export type Audience = "Members" | "MMB" | "Members & MMB" | "LC-wide";

export interface Opportunity {
  id: string;
  title: string;
  kind: OpportunityKind;
  audience: Audience;
  description: string;
  requirements: string[];
  /** ISO date */
  deadline: string;
  applyUrl: string;
  contact: string;
}

export interface DepartmentProgress {
  department: Department;
  metric: string;
  achieved: number;
  target: number;
}

export interface RankingEntry {
  scope: "MC" | "Global";
  measure: "Approvals" | "Realisations";
  position: number;
  outOf: number;
  /** Change in position vs. the previous period; positive means climbed. */
  movement: number;
}
