import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { Sector } from '../../store/useStore';
import Layout from '../ui/Layout';
import Explore from '../systems/ExploreSystem';
import MoviesSystem from '../systems/MoviesSystem';

import MyTickets from '../systems/TicketsSystem';
import History from '../systems/HistorySystem';
import Profile from '../systems/ProfileSystem';
import TheaterSystem from '../systems/TheaterSystem';

const HomeLayout = () => {
  const activeSector = useStore((state) => state.activeSector);
  const setActiveSector = useStore((state) => state.setActiveSector);
  const isEnteringTheater = useStore((state) => state.isEnteringTheater);

  // Intersection Observer for scroll spy
  useEffect(() => {
    // Only spy on scroll if we're not in the theater sequence
    if (isEnteringTheater) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectorId = entry.target.id as Sector;
            // Prevent redundant state updates
            if (useStore.getState().activeSector !== sectorId) {
              setActiveSector(sectorId);
            }
          }
        });
      },
      { threshold: 0.4 } // Trigger when 40% of the section is visible
    );

    const sections = document.querySelectorAll('section[data-sector]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [setActiveSector, isEnteringTheater]);

  const showStandardHUD = activeSector !== 'theater' && !isEnteringTheater;

  return (
    <div className="relative z-10 w-full flex flex-col pointer-events-none">
      {showStandardHUD && <Layout />}
      
      <main className="w-full relative flex flex-col">
        {(!isEnteringTheater && activeSector !== 'theater') ? (
          <>
            <section id="explore" data-sector="explore" className="w-full h-screen relative pointer-events-none">
              <div className="pointer-events-auto h-full w-full relative">
                <Explore />
              </div>
            </section>
            <section id="movies" data-sector="movies" className="w-full min-h-screen relative pointer-events-none pt-32 pb-24 border-t border-white/5 bg-gradient-to-b from-black/0 to-black/40">
              <div className="pointer-events-auto w-full relative">
                <MoviesSystem />
              </div>
            </section>

            <section id="tickets" data-sector="tickets" className="w-full min-h-screen relative pointer-events-none pt-32 pb-24 border-t border-white/5 bg-gradient-to-b from-black/0 to-black/40">
              <div className="pointer-events-auto w-full relative">
                <MyTickets />
              </div>
            </section>
            <section id="history" data-sector="history" className="w-full min-h-screen relative pointer-events-none pt-32 pb-24 border-t border-white/5 bg-gradient-to-b from-black/0 to-black/40">
              <div className="pointer-events-auto w-full relative">
                <History />
              </div>
            </section>
            <section id="profile" data-sector="profile" className="w-full min-h-screen relative pointer-events-none pt-32 pb-24 border-t border-white/5 bg-gradient-to-b from-black/0 to-black/40">
              <div className="pointer-events-auto w-full relative">
                <Profile />
              </div>
            </section>
          </>
        ) : (
          <section id="theater" data-sector="theater" className="w-full h-screen relative pointer-events-auto">
            <TheaterSystem />
          </section>
        )}
      </main>
    </div>
  );
};

export default HomeLayout;
