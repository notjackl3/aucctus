import AucctusSocketBootstrap from '@bootstraps/aucctusSocket.bootstrap';
import NavDrawer from '@components/Navigation/NavDrawer/NavDrawer';
import { FloatingSearchBar } from '@components/Overseer/FloatingSearchBar';
import { OverseerProvider } from '@context/OverseerProvider';
import { useAccountBranding } from '@hooks/query/accountBranding.hook';
import { useConcepts } from '@hooks/query/concepts.hook';
import { usePersonas } from '@hooks/query/persona.hook';
import { useOverseerRouteConfig } from '@hooks/useOverseerRouteConfig';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import type {
  IOverseerPendingImage,
  MentionItem,
} from '@stores/overseer/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateLayout = () => {
  const account = useStore((state) => state.auth.account);
  const user = useStore((state) => state.auth.user);
  const isDocked = useStore((state) => state.overseer.isDocked);
  const isOpen = useStore((state) => state.overseer.isOpen);
  const closeOverseer = useStore((state) => state.overseer.close);
  const openFromSearchBar = useStore(
    (state) => state.overseer.openFromSearchBar,
  );
  const openToHistory = useStore((state) => state.overseer.openToHistory);
  const sendMessage = useStore((state) => state.overseer.sendMessage);

  const location = useLocation();
  const { isEnabled, pageContext } = useOverseerRouteConfig();
  const isOverseerEnabled = isEnabled;

  // Close Overseer panel when page context changes to prevent stale state,
  // unless the Overseer itself triggered the navigation (highlighted section is set)
  const highlightedSectionId = useStore(
    (state) => state.overseer.highlightedSectionId,
  );
  const prevPageContext = useRef(pageContext);
  useEffect(() => {
    if (
      prevPageContext.current &&
      prevPageContext.current !== pageContext &&
      isOpen &&
      !highlightedSectionId
    ) {
      closeOverseer();
    }
    prevPageContext.current = pageContext;
  }, [pageContext, isOpen, closeOverseer, highlightedSectionId]);

  const shouldApplyDockPadding = isOverseerEnabled && isOpen && isDocked;

  // Floating search bar visibility — shown on all pages except excluded routes
  const isSearchBarVisible =
    location.pathname !== '/playground' &&
    !location.pathname.startsWith('/concept/incubate') &&
    !isOpen;

  // Fetch branding for floating search bar orb colors
  const { branding } = useAccountBranding();

  // Fetch concepts for @mention menu in the floating search bar
  const { data: conceptPage } = useConcepts({
    page: 1,
    pageSize: 199,
    enabled: isSearchBarVisible,
    reportStatusAggregate: 'complete',
  });
  const conceptItems: MentionItem[] = useMemo(() => {
    if (!conceptPage?.results) return [];
    return conceptPage.results.map((c) => ({
      id: c.uuid,
      name: c.title,
      type: 'concept' as const,
    }));
  }, [conceptPage?.results]);

  // Fetch personas for @mention menu in the floating search bar
  const { personas: personaList } = usePersonas();
  const personaItems: MentionItem[] = useMemo(() => {
    if (!personaList) return [];
    return personaList.map((p) => ({
      id: p.uuid,
      name: p.name,
      type: 'persona' as const,
      segment: p.segment,
      themeColor: p.themeColor,
      avatar: p.avatar,
    }));
  }, [personaList]);

  // Floating search bar submit handler — always starts a fresh conversation
  const handleSearchSubmit = useCallback(
    (
      message: string,
      images: IOverseerPendingImage[],
      mentionItems: MentionItem[],
    ) => {
      openFromSearchBar({
        message,
        pageContext: pageContext || 'general',
        images,
        mentions: mentionItems,
      });
      sendMessage();
    },
    [pageContext, openFromSearchBar, sendMessage],
  );

  const [navCollapsed, setNavCollapsed] = useState(true);
  if (user && !account) {
    return <Navigate to={AppPath.Onboarding} replace />;
  }

  const navWidth = navCollapsed ? 96 : 248;
  const dockWidth = shouldApplyDockPadding ? 412 : 0;

  return (
    <AucctusSocketBootstrap>
      <div className='aucctus-bg-secondary-extra-subtle flex min-h-screen flex-row items-start overflow-hidden'>
        <NavDrawer onExpandCollapse={setNavCollapsed} />
        <div
          data-scroll-container
          className={cn(
            'min-h-screen overflow-auto transition-all duration-300',
            {
              'w-[calc(100vw-6rem)]': navCollapsed,
              'ml-[6rem]': navCollapsed,
              'w-[calc(100vw-15.5rem)]': !navCollapsed,
              'ml-[15.5rem]': !navCollapsed,
              'pr-[412px]': shouldApplyDockPadding,
            },
          )}
        >
          <OverseerProvider
            pageContext={pageContext}
            enabled={isOverseerEnabled}
          >
            <Outlet />
          </OverseerProvider>
        </div>
        <FloatingSearchBar
          visible={isSearchBarVisible}
          onSubmit={handleSearchSubmit}
          onHistoryClick={openToHistory}
          leftOffset={navWidth}
          rightOffset={dockWidth}
          conceptItems={conceptItems}
          personaItems={personaItems}
          brandColors={branding?.colors}
        />
      </div>
    </AucctusSocketBootstrap>
  );
};

export default PrivateLayout;
