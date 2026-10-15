import { Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import BottomDock from "./BottomDock";
import { useTransitionDirection } from "./PageTransition";

/**
 * One scrolling column with the dock floating over it. No sidebar, no app chrome —
 * pages run full-bleed and navigation stays out of the way until it's wanted.
 */
const AppShell = () => {
  const { pathname } = useLocation();
  const direction = useTransitionDirection();

  return (
      <div className="min-h-svh">
        {/*
          Keyed on the path so each page mounts fresh and slides in from the left,
          picking up the movement where the transition panel leaves off.

          The transform stays on this wrapper and not on anything containing the dock:
          a transformed ancestor becomes the containing block for `position: fixed`,
          which would stop the dock being fixed to the viewport.
        */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: direction === 1 ? -28 : 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.42, ease: [0.33, 1, 0.68, 1] }}
        >
          <Outlet />
        </motion.div>

        {/* Clearance so the dock never covers the last line of a page. */}
        <div className="h-28" aria-hidden="true" />
        <BottomDock />
      </div>
  );
};

export default AppShell;
