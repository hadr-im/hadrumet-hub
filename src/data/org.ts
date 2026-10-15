import type { Department, Member } from "./types";

/**
 * The LC's people, built from a spec rather than written out one by one — there are
 * around seventy of them and the shape changes every term. Edit ORG_SPEC and the
 * whole structure, the tree and the directory follow.
 */

type DeptSpec = {
  dept: Department;
  /** How the VP's role reads in full. */
  vpRole: string;
  /** Support departments take managers. */
  managers?: number;
  /** Delivery departments take team leaders, with members split between them. */
  teamLeaders?: number;
  members?: number;
};

export const ORG_SPEC: DeptSpec[] = [
  { dept: "BD", vpRole: "VP Business Development", managers: 2 },
  { dept: "PM", vpRole: "VP Project Management", managers: 1 },
  { dept: "MKT", vpRole: "VP Marketing", managers: 3 },
  { dept: "IM", vpRole: "VP Information Management & Data", managers: 2 },
  { dept: "TM", vpRole: "VP Talent Management", managers: 1 },
  { dept: "F&L", vpRole: "VP Finance & Legal", managers: 1 },
  { dept: "oGTa", vpRole: "VP Outgoing Global Talent", teamLeaders: 4, members: 20 },
  { dept: "oGTe", vpRole: "VP Outgoing Global Teacher", teamLeaders: 2, members: 6 },
  { dept: "oGV", vpRole: "VP Outgoing Global Volunteer", teamLeaders: 2, members: 10 },
  { dept: "iGT", vpRole: "VP Incoming Global Talent", teamLeaders: 3, members: 6 },
  { dept: "iGV", vpRole: "VP Incoming Global Volunteer", teamLeaders: 2, members: 6 },
];

const FIRST_NAMES = [
  "Yasmine", "Mehdi", "Nour", "Amine", "Rania", "Selim", "Ines", "Oussama",
  "Khalil", "Sarra", "Hamza", "Maryem", "Firas", "Emna", "Aziz", "Dorra",
  "Bilel", "Syrine", "Walid", "Hiba", "Tarek", "Amal", "Youssef", "Salma",
  "Karim", "Meriem", "Anis", "Rim", "Hatem", "Olfa", "Zied", "Sana",
  "Nizar", "Asma", "Ramzi", "Takwa", "Wassim", "Chaima", "Ghassen", "Nesrine",
  "Marwen", "Ichrak", "Skander", "Yosra", "Fares", "Ahlem", "Malek", "Rahma",
  "Haythem", "Sirine", "Bassem", "Imen", "Seif", "Nadia", "Jalel", "Amira",
  "Aymen", "Hajer", "Chokri", "Leila", "Mondher", "Soumaya", "Riadh", "Nouha",
  "Sofien", "Rania", "Hichem", "Maha", "Lotfi", "Dhekra", "Kais", "Arij",
];

const SURNAMES = [
  "Cherif", "Trabelsi", "Hamdi", "Jemli", "Belhadj", "Boudaga", "Gharbi", "Khelifi",
  "Mansour", "Mejri", "Dridi", "Saidi", "Bouzid", "Larbi", "Ayari", "Sassi",
  "Jaziri", "Ben Salah", "Hammami", "Chaabane", "Zouari", "Rekik", "Toumi", "Guesmi",
  "Mabrouk", "Ferchichi", "Nasri", "Khemiri", "Baccouche", "Louati", "Slimane", "Arfaoui",
  "Ben Amor", "Hadj Ali", "Ouni", "Riahi", "Methnani", "Jebali", "Souei", "Krifa",
];

/** Deterministic, so the same person keeps the same name across reloads. */
const nameAt = (i: number) =>
  `${FIRST_NAMES[i % FIRST_NAMES.length]} ${SURNAMES[(i * 7) % SURNAMES.length]}`;

const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z ]/g, "").replace(/ +/g, ".");

const phoneAt = (i: number) =>
  `+216 ${20 + (i % 38)} ${String(100 + ((i * 137) % 900))} ${String(100 + ((i * 331) % 900))}`;

const JD: Record<Member["level"], (dept: Department, role: string) => string[]> = {
  lcp: () => [
    "Set the LC's direction for the term and hold the EB accountable to it.",
    "Represent Hadrumet to the MC, to partners and to the university.",
    "Chair the EB meeting and the monthly LC meeting.",
    "Own the LC's performance against its national targets.",
  ],
  vp: (dept) => [
    `Own the ${dept} department's plan, targets and delivery for the term.`,
    `Lead and develop the ${dept} team, and hold it to its sub-targets.`,
    "Report performance weekly to the LCP and the rest of the EB.",
    "Represent the department to the MC and to external partners.",
  ],
  manager: (dept) => [
    `Run a defined area of ${dept}'s work end to end.`,
    "Keep the department's trackers accurate and current.",
    "Escalate blockers to the VP early rather than late.",
  ],
  tl: (dept) => [
    `Lead a ${dept} team against its approval and realisation targets.`,
    "Coach each member through the full experience journey.",
    "Run weekly pipeline reviews and keep expa up to date.",
  ],
  member: (dept) => [
    `Deliver your share of the ${dept} pipeline.`,
    "Keep your own applications and follow-ups current.",
    "Bring blockers to your team leader in the weekly review.",
  ],
};

const person = (
  i: number,
  level: Member["level"],
  department: Member["department"],
  role: string,
  reportsTo: string | null,
): Member => {
  const name = nameAt(i);
  const dept = department === "EB" ? ("TM" as Department) : department;

  return {
    id: `p${i}`,
    name,
    role,
    department,
    level,
    reportsTo,
    email: `${slug(name)}@aiesec.net`,
    phone: phoneAt(i),
    photo: `https://i.pravatar.cc/160?u=hadrumet-${i}`,
    jobDescription: JD[level](dept, role),
  };
};

const build = (): Member[] => {
  const all: Member[] = [];
  let i = 0;

  const lcp = person(i++, "lcp", "EB", "LC President", null);
  all.push(lcp);

  for (const spec of ORG_SPEC) {
    const vp = person(i++, "vp", spec.dept, spec.vpRole, lcp.id);
    all.push(vp);

    for (let m = 0; m < (spec.managers ?? 0); m++) {
      all.push(person(i++, "manager", spec.dept, `${spec.dept} Manager`, vp.id));
    }

    const tlCount = spec.teamLeaders ?? 0;
    if (tlCount === 0) continue;

    const tls = Array.from({ length: tlCount }, () =>
      person(i++, "tl", spec.dept, `${spec.dept} Team Leader`, vp.id),
    );
    all.push(...tls);

    // Members spread as evenly as the count allows, so no team is left empty.
    const total = spec.members ?? 0;
    for (let m = 0; m < total; m++) {
      const tl = tls[m % tlCount];
      all.push(person(i++, "member", spec.dept, `${spec.dept} Member`, tl.id));
    }
  }

  return all;
};

export const members: Member[] = build();

export const lcp = members.find((m) => m.reportsTo === null)!;
export const reportsOf = (id: string) => members.filter((m) => m.reportsTo === id);
export const findMember = (id: string) => members.find((m) => m.id === id);

/** Everyone beneath a person, at any depth — used for the counts on a branch. */
export const descendantCount = (id: string): number =>
  reportsOf(id).reduce((n, child) => n + 1 + descendantCount(child.id), 0);
