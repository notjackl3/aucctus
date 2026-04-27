import AucctusSocketBootstrap from '@bootstraps/aucctusSocket.bootstrap';
import NavDrawer from '@components/Navigation/NavDrawer/NavDrawer';
import { FloatingSearchBar } from '@components/Overseer/FloatingSearchBar';
import { OverseerProvider } from '@context/OverseerProvider';
import { useAccountBranding } from '@hooks/query/accountBranding.hook';
import { useConcepts } from '@hooks/query/concepts.hook';
import { useJTBDJobs } from '@hooks/query/jtbd.hook';
import { usePersonas } from '@hooks/query/persona.hook';
import { useOverseerRouteConfig } from '@hooks/useOverseerRouteConfig';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
import { useInitiationStore } from '@stores/initiation.store';
import { useLayoutEditStore } from '@stores/layout-edit.store';
import type {
  IOverseerPendingImage,
  MentionItem,
} from '@stores/overseer/types';
import useStore from '@stores/store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Navigate,
  Outlet,
  useLocation,
  useSearchParams,
} from 'react-router-dom';

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
  const [searchParams] = useSearchParams();
  const { isEnabled, pageContext } = useOverseerRouteConfig();
  const isOverseerEnabled = isEnabled;

  // Close Overseer panel when page context changes to prevent stale state,
  // unless the Overseer itself triggered the navigation (highlighted section is set)
  const highlightedSectionId = useStore(
    (state) => state.overseer.highlightedSectionId,
  );
  const syncPageContext = useStore((state) => state.overseer.syncPageContext);
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

  useEffect(() => {
    if (pageContext) {
      syncPageContext(pageContext);
    }
  }, [pageContext, syncPageContext]);

  const shouldApplyDockPadding = isOverseerEnabled && isOpen && isDocked;

  // Hide search bar during persona widget layout editing
  const isEditingLayout = useLayoutEditStore((s) => s.isEditingLayout);

  // Hide search bar during first-run initiation screens
  const isShowingInitiation = useInitiationStore((s) => s.isShowingInitiation);

  // Floating search bar visibility — shown on all pages except excluded routes.
  // `/playground` normally hides the bar (ideation has its own search UI), but
  // when users switch to JTBD mode (`?mode=jtbd`) we surface the bar so
  // Overseer is available on the JTBD canvas.
  const isPlaygroundJtbdMode =
    location.pathname.startsWith('/playground') &&
    searchParams.get('mode') === 'jtbd';

  // JTBD renders its own full-viewport background inside the playground route;
  // skip the layout-level right dock padding so the bg extends under the
  // Overseer dock. JTBD content applies the offset internally instead.
  const shouldApplyLayoutDockPadding =
    shouldApplyDockPadding && !isPlaygroundJtbdMode;
  const isPlaygroundBlocked =
    location.pathname.startsWith('/playground') && !isPlaygroundJtbdMode;
  const isSearchBarVisible =
    !isPlaygroundBlocked &&
    !location.pathname.startsWith('/concept/incubate') &&
    !isOpen &&
    !isEditingLayout &&
    !isShowingInitiation;

  // Playground/JTBD owns its own full-viewport background and already reserves
  // bottom space internally (JTBDCardsSection pb-24), so skip the layout-level
  // pb-20 to avoid revealing the outer bg behind the search bar.
  const shouldApplyBottomPadding = isSearchBarVisible && !isPlaygroundJtbdMode;

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

  // JTBD mention items — surface jobs on the active canvas and widgets on the
  // currently-expanded job. Only populated on the JTBD canvas (pageContext ===
  // 'jtbd') so other routes pay no cost and retain the existing mention menu
  // behavior (personas + concepts only).
  const jtbdActiveConfigUuid = useStore(
    (state) => state.jtbdActive.activeConfigUuid,
  );
  const jtbdSelectedScanUuids = useStore(
    (state) => state.jtbdActive.selectedScanUuids,
  );
  const jtbdSelectedJobUuid = useStore(
    (state) => state.jtbdActive.selectedJobUuid,
  );
  const isOnJtbdCanvas = pageContext === 'jtbd';
  // `useJTBDJobs` shares its React Query cache with `JTBDCanvasInner`'s call,
  // so this mirrors exactly what the user sees on the canvas. Internally gated
  // on `configUuid && scanUuids.length > 0`, so it's a no-op when those are
  // empty (e.g. off the canvas).
  const { jobs: jtbdJobs } = useJTBDJobs(
    isOnJtbdCanvas ? (jtbdActiveConfigUuid ?? '') : '',
    isOnJtbdCanvas ? jtbdSelectedScanUuids : [],
  );
  const jtbdJobItems: MentionItem[] = useMemo(() => {
    if (!isOnJtbdCanvas || jtbdJobs.length === 0) return [];
    return jtbdJobs.map((j) => ({
      id: j.uuid,
      name: j.jtbdTitle?.trim() || 'Untitled job',
      type: 'jtbd_job' as const,
    }));
  }, [isOnJtbdCanvas, jtbdJobs]);
  const jtbdWidgetItems: MentionItem[] = useMemo(() => {
    if (!isOnJtbdCanvas || !jtbdSelectedJobUuid) return [];
    const selectedJob = jtbdJobs.find((j) => j.uuid === jtbdSelectedJobUuid);
    if (!selectedJob) return [];
    return selectedJob.customWidgets.map((w) => ({
      id: w.uuid,
      name:
        w.title?.trim() ||
        w.widgetType
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      type: 'jtbd_widget' as const,
    }));
  }, [isOnJtbdCanvas, jtbdSelectedJobUuid, jtbdJobs]);

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
              'pr-[412px]': shouldApplyLayoutDockPadding,
              'pb-20': shouldApplyBottomPadding,
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
          jtbdJobItems={jtbdJobItems}
          jtbdWidgetItems={jtbdWidgetItems}
          brandColors={branding?.colors}
        />
      </div>
    </AucctusSocketBootstrap>
  );
};

export default PrivateLayout;
