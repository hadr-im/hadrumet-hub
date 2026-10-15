import type {
  Activity,
  Announcement,
  Corner,
  Department,
  DepartmentProgress,
  Opportunity,
  RankingEntry,
  Resource,
  Template,
} from "./types";

/** People live in their own module, since the org is generated from a spec. */
export { members, lcp, reportsOf, findMember, descendantCount } from "./org";

/**
 * Static stand-in data for the design pass. Every date sits around
 * October 2026 so the calendar and "next up" card have something to show.
 */
export const TODAY = "2026-10-14";

export const CORNERS: { id: Corner; label: string; departments: string[] }[] = [
  { id: "brand", label: "Brand Corner", departments: ["BD", "MKT", "PM"] },
  {
    id: "exchange",
    label: "Exchange Corner",
    departments: ["oGV", "oGTa", "oGTe", "iGV", "iGT"],
  },
  { id: "power", label: "Power Corner", departments: ["IM", "TM", "F&L"] },
  {
    id: "general",
    label: "General Knowledge",
    departments: ["AIESEC Culture", "Leadership", "Conferences", "Cross-functional"],
  },
];

export const DEPARTMENTS: Department[] = [
  "BD",
  "PM",
  "MKT",
  "IM",
  "TM",
  "F&L",
  "oGTa",
  "oGTe",
  "oGV",
  "iGT",
  "iGV",
];

/** The full name behind each abbreviation, for labels and tooltips. */
export const DEPARTMENT_NAME: Record<Department, string> = {
  BD: "Business Development",
  PM: "Project Management",
  MKT: "Marketing",
  IM: "Information Management & Data",
  TM: "Talent Management",
  "F&L": "Finance & Legal",
  oGTa: "Outgoing Global Talent",
  oGTe: "Outgoing Global Teacher",
  oGV: "Outgoing Global Volunteer",
  iGT: "Incoming Global Talent",
  iGV: "Incoming Global Volunteer",
};

/** Which corner a department belongs to — drives chip colour across the app. */
export const DEPARTMENT_CORNER: Record<Department, Corner> = {
  BD: "brand",
  PM: "brand",
  MKT: "brand",
  oGV: "exchange",
  oGTa: "exchange",
  oGTe: "exchange",
  iGV: "exchange",
  iGT: "exchange",
  IM: "power",
  TM: "power",
  "F&L": "power",
};

export const WORKING_HOURS = {
  days: "Monday – Friday",
  hours: "16:00 – 20:00",
  note: "Saturday reserved for LC-wide meetings and trainings.",
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/640/400`;

/** Every activity carries the LC's mark until real photography exists for them. */
import logo from "../assets/hadrumet-logo.png";

export const activities: Activity[] = [
  {
    id: "a1",
    name: "Newbies Recruitment",
    date: "2026-10-03",
    startTime: "09:00",
    endTime: "17:00",
    venue: "ISSAT Sousse",
    organizer: "Ines Hamdi",
    department: "TM",
    type: "event",
    description:
      "Recruitment day for the new intake. Stands, info sessions and first interviews, all in one sitting.",
    image: logo,
  },
  {
    id: "a2",
    name: "LC Kickoff",
    date: "2026-10-15",
    startTime: "16:00",
    endTime: "20:00",
    venue: "Hadrumet Office",
    organizer: "Yasmine Cherif",
    department: "LC-wide",
    type: "event",
    description:
      "The term opens properly: direction for the months ahead, targets per department, and the new members meeting the LC for the first time.",
    image: logo,
  },
  {
    id: "a3",
    name: "LMS OC Pre-meeting",
    date: "2026-10-15",
    startTime: "14:00",
    endTime: "15:30",
    venue: "Hadrumet Office",
    organizer: "Ines Hamdi",
    department: "LC-wide",
    type: "meeting",
    description:
      "The organising committee runs through the final checks before the conference: venue, delegates, sessions and who is on what.",
    image: logo,
  },
  {
    id: "a4",
    name: "LMS Conference",
    date: "2026-10-16",
    endDate: "2026-10-18",
    startTime: "09:00",
    endTime: "22:00",
    venue: "To be confirmed",
    organizer: "Ines Hamdi",
    department: "LC-wide",
    type: "conference",
    description:
      "Three days of the Local Members Seminar — tracks for every functional area, and the term's main education moment for the whole LC.",
    image: logo,
  },
  {
    id: "a5",
    name: "VOCs",
    date: "2026-10-20",
    endDate: "2026-10-31",
    startTime: "17:00",
    endTime: "19:00",
    venue: "Online",
    organizer: "Ines Hamdi",
    department: "TM",
    type: "training",
    description:
      "A fortnight of onboarding calls for the new intake, run department by department so every newbie starts with the same grounding.",
    image: logo,
  },
  {
    id: "a6",
    name: "LC Growth Hacks",
    date: "2026-11-04",
    endDate: "2026-11-05",
    startTime: "16:00",
    endTime: "20:00",
    venue: "Hadrumet Office",
    organizer: "Yasmine Cherif",
    department: "LC-wide",
    type: "training",
    description:
      "Two days working on what is actually holding the LC back, and leaving with changes the departments have committed to.",
    image: logo,
  },
];

export const announcements: Announcement[] = [
  {
    id: "n1",
    title: "October NMS deadline",
    body: "The National Membership Survey closes on Friday. Every member needs to have submitted theirs — the LC's score is counted against the number of members we have, not the number who answered, so a blank is a zero.",
    postedOn: "2026-10-13",
    dueOn: "2026-10-16",
    audience: "Whole LC",
    author: "Ines Hamdi, VP TM",
    urgent: true,
    pinned: true,
  },
  {
    id: "n2",
    title: "LMS conference fees — collection closes",
    body: "Fees for the Local Members Seminar are collected until tomorrow evening. Anyone unpaid by then loses their seat to the waiting list, and the LC cannot cover late payments.",
    postedOn: "2026-10-12",
    dueOn: "2026-10-15",
    audience: "Whole LC",
    author: "Dorra Ferchichi, VP Finance & Legal",
    urgent: true,
    pinned: false,
  },
  {
    id: "n3",
    title: "MMB calibration meeting",
    body: "Managers and team leaders meet on Sunday to calibrate on the term's targets and on how performance is being tracked across departments. Come with your own numbers already pulled.",
    postedOn: "2026-10-11",
    dueOn: "2026-10-18",
    audience: "EB & MMB",
    author: "Yasmine Cherif, LCP",
    urgent: false,
    pinned: true,
  },
  {
    id: "n4",
    title: "10th LC meeting",
    body: "The tenth LC meeting of the term is this Sunday. Department updates, the NMS results, and the plan for the winter peak. Attendance counts toward membership standing.",
    postedOn: "2026-10-10",
    dueOn: "2026-10-18",
    audience: "Whole LC",
    author: "Yasmine Cherif, LCP",
    urgent: false,
    pinned: false,
  },
  {
    id: "n5",
    title: "Member of the month",
    body: "The member of the month for September has been announced, along with the reasoning behind the choice and what the rest of us can take from it.",
    postedOn: "2026-10-09",
    audience: "Whole LC",
    author: "Ines Hamdi, VP TM",
    urgent: false,
    pinned: false,
  },
];


export const resources: Resource[] = [
  {
    id: "r1",
    title: "LC Compendium",
    kind: "document",
    corner: "general",
    category: "AIESEC Culture",
    description:
      "How Hadrumet governs itself: the rules, the roles and the decisions that hold from one term to the next.",
    updatedOn: "2026-09-26",
    url: "#",
  },
  {
    id: "r2",
    title: "Data Training Session",
    kind: "video",
    corner: "power",
    category: "IM",
    description:
      "Recording of the session on reading the LC's numbers — where each figure comes from and what it should make you do.",
    updatedOn: "2026-10-10",
    url: "#",
  },
  {
    id: "r3",
    title: "EP Tracking Tool — Tutorial",
    kind: "video",
    corner: "power",
    category: "IM",
    description:
      "A walkthrough of the tracking tool: logging an EP, moving them through the stages, and keeping the pipeline honest.",
    updatedOn: "2026-10-04",
    url: "#",
  },
  {
    id: "r4",
    title: "B2C Capacity Building",
    kind: "presentation",
    corner: "exchange",
    category: "oGTa",
    description:
      "Selling to a student rather than a company: the conversation, the objections, and what actually moves someone to apply.",
    updatedOn: "2026-09-29",
    url: "#",
  },
  {
    id: "r5",
    title: "Sales B2B Life Hacks",
    kind: "presentation",
    corner: "brand",
    category: "BD",
    description:
      "What the BD team has learned the hard way about reaching decision makers and getting a second meeting.",
    updatedOn: "2026-09-21",
    url: "#",
  },
  {
    id: "r6",
    title: "IR Capacity Building",
    kind: "presentation",
    corner: "exchange",
    category: "iGV",
    description:
      "Building international relations that hold: choosing partner LCs, opening the conversation, and keeping it alive between peaks.",
    updatedOn: "2026-09-17",
    url: "#",
  },
  {
    id: "r7",
    title: "EP Contacting Tips",
    kind: "document",
    corner: "exchange",
    category: "oGV",
    description:
      "First contact through to sign-up — timing, channel and tone, with the messages that work and the ones that get ignored.",
    updatedOn: "2026-10-06",
    url: "#",
  },
  {
    id: "r8",
    title: "Graphic Design Capacity Building",
    kind: "presentation",
    corner: "brand",
    category: "MKT",
    description:
      "Designing for AIESEC: working inside the brand guidelines without every post looking the same.",
    updatedOn: "2026-09-13",
    url: "#",
  },
  {
    id: "r9",
    title: "Market Analysis Capacity Building",
    kind: "presentation",
    corner: "exchange",
    category: "iGT",
    description:
      "Reading the local market before you sell into it: who is hiring, what they need, and where the LC can realistically deliver.",
    updatedOn: "2026-09-24",
    url: "#",
  },
];


export const templates: Template[] = [
  {
    id: "t1",
    title: "Synergy Verbal Process",
    category: "meeting",
    owner: "LC-wide",
    format: "doc",
    description:
      "The minutes format for synergy meetings: decisions taken, who owns each action, and by when.",
    updatedOn: "2026-10-05",
    url: "#",
  },
  {
    id: "t2",
    title: "Financial Report",
    category: "financial",
    owner: "F&L",
    format: "sheet",
    description:
      "The monthly figures every department submits to Finance, in the format the MC expects back.",
    updatedOn: "2026-10-11",
    url: "#",
  },
  {
    id: "t3",
    title: "iGV Invitation Letter",
    category: "exchange",
    owner: "iGV",
    format: "doc",
    description:
      "Issued to an incoming volunteer once matched, for their visa application and travel.",
    updatedOn: "2026-09-22",
    url: "#",
  },
  {
    id: "t4",
    title: "iGT Invitation Letter",
    category: "exchange",
    owner: "iGT",
    format: "doc",
    description:
      "Issued to an incoming talent EP once matched, naming the host company and the dates.",
    updatedOn: "2026-09-22",
    url: "#",
  },
  {
    id: "t5",
    title: "oGV Invitation Letter",
    category: "exchange",
    owner: "oGV",
    format: "doc",
    description:
      "Requested from the hosting LC for an outgoing volunteer, and kept on file here.",
    updatedOn: "2026-09-18",
    url: "#",
  },
  {
    id: "t6",
    title: "oGT Invitation Letter",
    category: "exchange",
    owner: "oGTa",
    format: "doc",
    description:
      "Requested from the hosting LC for an outgoing talent or teacher, and kept on file here.",
    updatedOn: "2026-09-18",
    url: "#",
  },
  {
    id: "t7",
    title: "ICX Accommodation Booklet",
    category: "exchange",
    owner: "iGV",
    format: "doc",
    description:
      "What an incoming EP is given on arrival: where they are staying, house rules and contacts.",
    updatedOn: "2026-10-02",
    url: "#",
  },
  {
    id: "t10",
    title: "iGV Sales Guidelines",
    category: "guidelines",
    owner: "iGV",
    format: "doc",
    description:
      "How the iGV team approaches a sale and closes it: the openers that work, the objections that come up, and where people usually lose the EP.",
    updatedOn: "2026-09-30",
    url: "#",
  },
  {
    id: "t11",
    title: "oGT EP Process Explained",
    category: "guidelines",
    owner: "oGTa",
    format: "doc",
    description:
      "The outgoing talent journey end to end, stage by stage, naming who owns the EP at each step.",
    updatedOn: "2026-10-07",
    url: "#",
  },
  {
    id: "t8",
    title: "Sales Proposal",
    category: "partnership",
    owner: "BD",
    format: "slides",
    description:
      "The deck taken into a partnership meeting, with the packages and pricing already set.",
    updatedOn: "2026-09-28",
    url: "#",
  },
  {
    id: "t9",
    title: "LOG Proposal",
    category: "partnership",
    owner: "BD",
    format: "slides",
    description:
      "For in-kind partnerships: what the LC asks for, and what the partner gets in return.",
    updatedOn: "2026-09-28",
    url: "#",
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "op1",
    title: "Organising Committee — Youth Speak Forum",
    kind: "event-oc",
    audience: "Members & MMB",
    description:
      "Build the LC's flagship external event from the ground up. You take one workstream — programme, logistics, partnerships or delegates — and own it from the first planning meeting through to the day itself.",
    requirements: [
      "Open to members and MMB",
      "Around 6 hours a week through to the event",
      "Your VP's endorsement",
    ],
    deadline: "2026-10-24",
    applyUrl: "#",
    contact: "Nour Hamdi",
  },
  {
    id: "op2",
    title: "ICX Local Support Team",
    kind: "lst",
    audience: "Members & MMB",
    description:
      "Carry the incoming exchange teams through the winter peak: welcoming EPs, settling them into their accommodation, and making sure the experience they were sold is the one they get.",
    requirements: [
      "Open to members and MMB",
      "Available across the winter peak",
      "Comfortable working in English",
    ],
    deadline: "2026-10-29",
    applyUrl: "#",
    contact: "Rania Belhadj",
  },
  {
    id: "op3",
    title: "UBA Team",
    kind: "uba",
    audience: "Members & MMB",
    description:
      "Put AIESEC in front of students where they already are. The UBA team runs the activities on campus that bring new people into the LC and keep Hadrumet visible through the year.",
    requirements: [
      "Open to members and MMB",
      "On campus most weeks",
      "Happy approaching people you don't know",
    ],
    deadline: "2026-11-05",
    applyUrl: "#",
    contact: "Ines Gharbi",
  },
  {
    id: "op4",
    title: "IM Local Support Team",
    kind: "lst",
    audience: "Members",
    description:
      "Spend a term alongside IM & Data. You keep the trackers honest, help departments read their own numbers, and learn the tooling the whole LC runs on — the best way into the function without committing to it.",
    requirements: [
      "Open to members only",
      "Working knowledge of spreadsheets",
      "One term, roughly 4 hours a week",
    ],
    deadline: "2026-11-02",
    applyUrl: "#",
    contact: "Selim Boudaga",
  },
  {
    id: "op5",
    title: "Tunisia Entity Support Team",
    kind: "est",
    audience: "LC-wide",
    description:
      "Join the support team running the national conference in Tunisia: delegate care, logistics and keeping the venue moving across the conference days.",
    requirements: [
      "Open to anyone in the LC",
      "Available for the full conference and the day before",
      "Travel and stay covered",
    ],
    deadline: "2026-10-17",
    applyUrl: "#",
    contact: "Yasmine Cherif",
  },
  {
    id: "op6",
    title: "Belgium Entity Support Team",
    kind: "est",
    audience: "LC-wide",
    description:
      "Work directly with AIESEC in Belgium for a term, supporting their team remotely. A rare look at how another entity runs, and experience that counts when you apply abroad later.",
    requirements: [
      "Open to anyone in the LC",
      "Comfortable working in English across time zones",
      "One term, alongside your current role",
    ],
    deadline: "2026-11-14",
    applyUrl: "#",
    contact: "Yasmine Cherif",
  },
  {
    id: "op7",
    title: "Career Fair Support Team",
    kind: "event-oc",
    audience: "LC-wide",
    description:
      "Represent Hadrumet at the university career fair — the stand, the pitch, and catching every lead that walks past so none of them go cold afterwards.",
    requirements: [
      "Open to anyone in the LC",
      "Available across the two fair days",
      "Briefing session the week before",
    ],
    deadline: "2026-10-20",
    applyUrl: "#",
    contact: "Mehdi Khelifi",
  },
];

export const departmentProgress: DepartmentProgress[] = [
  // Only the exchange departments carry approval targets — they are what the LC is
  // ranked on. Their monthly targets add up to the LC's own.
  { department: "iGV", metric: "Approvals", achieved: 13, target: 14 },
  { department: "oGV", metric: "Approvals", achieved: 14, target: 20 },
  { department: "iGT", metric: "Approvals", achieved: 7, target: 10 },
  { department: "oGTa", metric: "Approvals", achieved: 4, target: 10 },
  { department: "oGTe", metric: "Approvals", achieved: 3, target: 6 },
];

/** The LC's headline number for the month: approvals against target. */
export const monthlyTarget = {
  month: "October",
  metric: "Approvals",
  achieved: 41,
  target: 60,
};

export const rankings: RankingEntry[] = [
  { scope: "MC", measure: "Approvals", position: 3, outOf: 12, movement: 2 },
  { scope: "Global", measure: "Approvals", position: 287, outOf: 1800, movement: 41 },
];

export const achievements = [
  {
    year: "2026",
    title: "Best Growing LC — MC Tunisia",
    detail: "Awarded at the national transition conference.",
    image: img("award-growing-lc"),
  },
  {
    year: "2025",
    title: "Top 3 in oGV Realisations",
    detail: "Closed the term at 118% of target.",
    image: img("ogv-top-three"),
  },
  {
    year: "2025",
    title: "First Youth Speak Forum in Sousse",
    detail: "320 attendees, 6 corporate partners.",
    image: img("ysf-sousse"),
  },
  {
    year: "2024",
    title: "LC of the Year — Runner Up",
    detail: "Across all performance and culture criteria.",
    image: img("lc-of-the-year"),
  },
];

