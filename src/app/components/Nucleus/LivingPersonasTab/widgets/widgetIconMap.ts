/**
 * widgetIconMap - Maps widget icon string names to lucide-react components
 *
 * Used by GlassWidget, WidgetIconPicker, and AddWidgetModal to render
 * dynamic lucide icons from string icon names stored in the backend.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Globe,
  Heart,
  Lightbulb,
  MapPin,
  PieChart,
  Shield,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

/** Map of icon string names to lucide-react components */
export const WIDGET_ICON_MAP: Record<string, LucideIcon> = {
  'alert-circle': AlertCircle,
  'bar-chart-3': BarChart3,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  users: Users,
  target: Target,
  'dollar-sign': DollarSign,
  'shopping-cart': ShoppingCart,
  'building-2': Building2,
  globe: Globe,
  heart: Heart,
  lightbulb: Lightbulb,
  clock: Clock,
  'map-pin': MapPin,
  briefcase: Briefcase,
  star: Star,
  shield: Shield,
  zap: Zap,
  'book-open': BookOpen,
  activity: Activity,
  award: Award,
};

/** All available widget icon names */
export const WIDGET_ICON_NAMES = Object.keys(WIDGET_ICON_MAP);

/** Get a lucide icon component by name, with optional fallback */
export const getWidgetIcon = (name: string): LucideIcon | undefined => {
  return WIDGET_ICON_MAP[name];
};
