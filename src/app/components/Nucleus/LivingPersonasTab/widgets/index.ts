/**
 * Persona Widgets
 *
 * Widget components for displaying persona attributes and data.
 */

export { default as GlassWidget, getWidgetSizeClass } from './GlassWidget';
export type { GlassWidgetProps, WidgetSize } from './GlassWidget';

export { default as CardListWidget } from './CardListWidget';
export type {
  CardListWidgetProps,
  CardListItem,
  ScaleConfig,
} from './CardListWidget';

export { default as GainsWidget } from './GainsWidget';
export type { GainsWidgetProps, GainItem } from './GainsWidget';

export { default as SocialValuesWidget } from './SocialValuesWidget';
export type {
  SocialValuesWidgetProps,
  SocialValueItem,
} from './SocialValuesWidget';

export { default as TabbedCardListWidget } from './TabbedCardListWidget';
export type {
  TabbedCardListWidgetProps,
  TabConfig,
} from './TabbedCardListWidget';

export { default as JobsWidget } from './JobsWidget';
export type { JobsWidgetProps, JobItem } from './JobsWidget';

export { default as PainsWidget } from './PainsWidget';
export type { PainsWidgetProps, PainItem } from './PainsWidget';

export { default as MotivationsBehavioursWidget } from './MotivationsBehavioursWidget';
export type {
  MotivationsBehavioursWidgetProps,
  MotivationBehaviourItem,
} from './MotivationsBehavioursWidget';

export { default as KeyFactsWidget } from './KeyFactsWidget';
export type {
  KeyFactsWidgetProps,
  KeyFact,
  TrendDirection,
} from './KeyFactsWidget';

export { default as QuotesCarouselWidget } from './QuotesCarouselWidget';
export type {
  QuotesCarouselWidgetProps,
  PersonaQuote,
} from './QuotesCarouselWidget';

export { default as TimelineWidget } from './TimelineWidget';
export type { TimelineWidgetProps, TimelineStep } from './TimelineWidget';

export { default as MetricChartWidget } from './MetricChartWidget';
export type { MetricChartWidgetProps } from './MetricChartWidget';

export { default as CustomWidgetRenderer } from './CustomWidgetRenderer';
export type { CustomWidgetRendererProps } from './CustomWidgetRenderer';

export { default as WidgetIconPicker } from './WidgetIconPicker';
export type { WidgetIconPickerProps } from './WidgetIconPicker';

export { default as PersonaWidgetGrid } from './PersonaWidgetGrid';
export type {
  PersonaWidgetGridProps,
  PersonaWidgetData,
  WidgetConfig,
  ContentMutationCallbacks,
  CustomWidgetCallbacks,
} from './PersonaWidgetGrid';
