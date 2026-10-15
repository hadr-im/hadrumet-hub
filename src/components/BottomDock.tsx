import {
  BookOpen,
  Compass,
  FileText,
  Home,
} from "lucide-react";
import { FloatingDock } from "./ui/floating-dock";

/* Colour is set by the dock itself, so the active state can drive it. */
const ICON = "h-full w-full";
const STROKE = 1.25;

const ITEMS = [
  { title: "Home", icon: <Home className={ICON} strokeWidth={STROKE} />, href: "/" },
  {
    title: "Knowledge Center",
    icon: <BookOpen className={ICON} strokeWidth={STROKE} />,
    href: "/knowledge",
  },
  {
    title: "Processes & Templates",
    icon: <FileText className={ICON} strokeWidth={STROKE} />,
    href: "/processes",
  },
  {
    title: "Opportunities",
    icon: <Compass className={ICON} strokeWidth={STROKE} />,
    href: "/opportunities",
  },
];

/** Fixed navigation, docked to the bottom of every page. */
const BottomDock = () => (
  <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
    <div className="pointer-events-auto">
      <FloatingDock items={ITEMS} />
    </div>
  </div>
);

export default BottomDock;

