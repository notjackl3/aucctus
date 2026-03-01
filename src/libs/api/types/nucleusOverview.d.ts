// Nucleus Overview Widget Type Definitions
// Based on Osiris schemas in apps/accounts/schemas/nucleus_overview.py

// ============================================
// Enums & Literals
// ============================================

export type NucleusOverviewWidgetType =
  | 'thesis'
  | 'card_list'
  | 'checklist'
  | 'accordion'
  | 'visualization'
  | 'constrained_text';

// ============================================
// Item Types
// ============================================

export interface IOverviewCardListItem {
  uuid: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface IOverviewChecklistItem {
  uuid: string;
  text: string;
  order: number;
}

export interface IOverviewAccordionItem {
  uuid: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export interface IOverviewVisualizationItem {
  uuid: string;
  label: string;
  shortName: string;
  title: string;
  description: string;
  order: number;
}

export interface IOverviewConstrainedTextItem {
  uuid: string;
  line1: string;
  line2: string;
  order: number;
}

// ============================================
// Widget Type
// ============================================

export interface INucleusOverviewWidget {
  uuid: string;
  widgetType: NucleusOverviewWidgetType;
  title: string;
  description: string;
  icon: string;
  order: number;
  cardListItems: IOverviewCardListItem[];
  checklistItems: IOverviewChecklistItem[];
  accordionItems: IOverviewAccordionItem[];
  visualizationItems: IOverviewVisualizationItem[];
  constrainedTextItems: IOverviewConstrainedTextItem[];
}

// ============================================
// Create/Update Payloads
// ============================================

export interface ICreateNucleusOverviewWidgetPayload {
  widgetType: NucleusOverviewWidgetType;
  title: string;
  description?: string;
  icon?: string;
  initialItems?: ICreateOverviewWidgetItemPayload[];
}

export interface IUpdateNucleusOverviewWidgetPayload {
  title?: string;
  description?: string;
  icon?: string;
}

/** Generic widget item payload — union of all item fields. Used for initial_items on widget creation. */
export interface ICreateOverviewWidgetItemPayload {
  // card_list
  title?: string;
  description?: string;
  icon?: string;
  // checklist
  text?: string;
  // accordion
  name?: string;
  // visualization
  label?: string;
  shortName?: string;
  // constrained_text
  line1?: string;
  line2?: string;
}

// Per-type create payloads
export interface ICreateCardListItemPayload {
  title: string;
  description?: string;
  icon?: string;
}

export interface ICreateChecklistItemPayload {
  text: string;
}

export interface ICreateAccordionItemPayload {
  name: string;
  description?: string;
  icon?: string;
}

export interface ICreateVisualizationItemPayload {
  label: string;
  shortName?: string;
  title: string;
  description?: string;
}

export interface ICreateConstrainedTextItemPayload {
  line1: string;
  line2?: string;
}

// Per-type update payloads
export interface IUpdateCardListItemPayload {
  title?: string;
  description?: string;
  icon?: string;
}

export interface IUpdateChecklistItemPayload {
  text?: string;
}

export interface IUpdateAccordionItemPayload {
  name?: string;
  description?: string;
  icon?: string;
}

export interface IUpdateVisualizationItemPayload {
  label?: string;
  shortName?: string;
  title?: string;
  description?: string;
}

export interface IUpdateConstrainedTextItemPayload {
  line1?: string;
  line2?: string;
}

// ============================================
// Reorder
// ============================================

export interface IReorderOverviewItemsPayload {
  orderedUuids: string[];
}

// ============================================
// Generate Response
// ============================================

export interface IGenerateOverviewResponse {
  status: string;
  reportUuid: string;
}
