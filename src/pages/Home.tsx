import AchievementsSection from "../components/home/AchievementsSection";
import Announcements from "../components/home/Announcements";
import CalendarSection from "../components/home/CalendarSection";
import ClosingBand from "../components/home/ClosingBand";
import Hero from "../components/home/Hero";
import PerformanceSection from "../components/home/PerformanceSection";
import StructureSection from "../components/home/StructureSection";

const Home = () => (
  <>
    <Hero />
    <Announcements />
    <CalendarSection />
    <StructureSection />
    <PerformanceSection />
    <AchievementsSection />
    <ClosingBand />
  </>
);

export default Home;
