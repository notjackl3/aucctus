import React from 'react';
import { Icon } from '@components';
import { InsightCard } from '../types';

export const getSentimentColor = (
  sentiment: InsightCard['sentiment'],
  source?: string,
) => {
  if (source === 'Possible Answer') {
    return 'bg-yellow-500/20 border-yellow-400/30 hover:bg-yellow-500/30';
  }
  return 'bg-white/10 border-white/20 hover:bg-white/15';
};

export const getSentimentIcon = (sentiment: InsightCard['sentiment']) => {
  switch (sentiment) {
    case 'headwind':
      return (
        <Icon
          variant='trending-down'
          className='aucctus-stroke-error-primary'
          height={12}
          width={12}
        />
      );
    case 'tailwind':
      return (
        <Icon
          variant='trendup'
          className='aucctus-stroke-success-primary'
          height={12}
          width={12}
        />
      );
    case 'neutral':
      return (
        <Icon
          variant='minus'
          className='aucctus-stroke-info-primary'
          height={12}
          width={12}
        />
      );
    default:
      return null;
  }
};

export const getSentimentDescription = (
  sentiment: InsightCard['sentiment'],
) => {
  switch (sentiment) {
    case 'headwind':
      return 'Headwind: Challenge or obstacle that may slow progress';
    case 'tailwind':
      return 'Tailwind: Favorable factor that supports progress';
    case 'neutral':
      return 'Neutral: Balanced factor with no clear directional impact';
    default:
      return '';
  }
};

export interface CardPositionRects {
  leftNav?: DOMRect;
  rightNav?: DOMRect;
  questionCard?: DOMRect;
  container?: DOMRect;
}

export const calculateCardPositions = (
  totalCards: number,
  index: number,
  rects?: CardPositionRects,
) => {
  // If rects aren't provided, use fallback values
  if (
    !rects?.leftNav ||
    !rects?.rightNav ||
    !rects?.questionCard ||
    !rects?.container
  ) {
    // Fallback to approximate values
    const questionCardWidth = 512;
    const questionCardHeight = 200;
    const navButtonWidth = 48;
    const navButtonMargin = 32;

    const leftSpaceStart =
      -(window.innerWidth / 2) + navButtonMargin + navButtonWidth;
    const leftSpaceEnd = -questionCardWidth / 2;
    const leftCenterX = (leftSpaceStart + leftSpaceEnd) / 2;

    const rightSpaceStart = questionCardWidth / 2;
    const rightSpaceEnd =
      window.innerWidth / 2 - navButtonMargin - navButtonWidth;
    const rightCenterX = (rightSpaceStart + rightSpaceEnd) / 2;

    const topSpaceStart = -(window.innerHeight / 2) + 40;
    const topSpaceEnd = -questionCardHeight / 2;
    const topCenterY = (topSpaceStart + topSpaceEnd) / 2;

    const bottomSpaceStart = questionCardHeight / 2;
    const bottomSpaceEnd = window.innerHeight / 2 - 100;
    const bottomCenterY = (bottomSpaceStart + bottomSpaceEnd) / 2;

    return calculatePositionsFromCenters(
      totalCards,
      index,
      leftCenterX,
      rightCenterX,
      topCenterY,
      bottomCenterY,
    );
  }

  // Calculate actual positions using real DOM rects
  const { leftNav, rightNav, questionCard, container } = rects;

  // Get container center (reference point for all positions)
  const containerCenterX = container.left + container.width / 2;
  const containerCenterY = container.top + container.height / 2;

  // Calculate left space: between right edge of left nav and left edge of question card
  const leftSpaceStart = leftNav.right;
  const leftSpaceEnd = questionCard.left;
  const leftSpaceCenter = (leftSpaceStart + leftSpaceEnd) / 2;
  const leftCenterX = leftSpaceCenter - containerCenterX;

  // Calculate right space: between right edge of question card and left edge of right nav
  const rightSpaceStart = questionCard.right;
  const rightSpaceEnd = rightNav.left;
  const rightSpaceCenter = (rightSpaceStart + rightSpaceEnd) / 2;
  const rightCenterX = rightSpaceCenter - containerCenterX;

  // Calculate top space: between top of container and top of question card
  const topSpaceStart = container.top;
  const topSpaceEnd = questionCard.top;
  const topSpaceCenter = (topSpaceStart + topSpaceEnd) / 2;
  const topCenterY = topSpaceCenter - containerCenterY;

  // Calculate bottom space: between bottom of question card and bottom of container
  const bottomSpaceStart = questionCard.bottom;
  const bottomSpaceEnd = container.bottom;
  const bottomSpaceCenter = (bottomSpaceStart + bottomSpaceEnd) / 2;
  const bottomCenterY = bottomSpaceCenter - containerCenterY;

  return calculatePositionsFromCenters(
    totalCards,
    index,
    leftCenterX,
    rightCenterX,
    topCenterY,
    bottomCenterY,
  );
};

const calculatePositionsFromCenters = (
  totalCards: number,
  index: number,
  leftCenterX: number,
  rightCenterX: number,
  topCenterY: number,
  bottomCenterY: number,
) => {
  // For small counts (4-6), use predefined positions for aesthetic control
  if (totalCards === 4) {
    const positions = [
      { x: 0, y: topCenterY }, // top
      { x: rightCenterX, y: 0 }, // right
      { x: 0, y: bottomCenterY }, // bottom
      { x: leftCenterX, y: 0 }, // left
    ];
    return positions[index];
  }

  if (totalCards === 5) {
    const positions = [
      { x: 0, y: topCenterY }, // top
      { x: rightCenterX, y: topCenterY / 2 }, // right-top
      { x: rightCenterX, y: bottomCenterY / 2 }, // right-bottom
      { x: 0, y: bottomCenterY }, // bottom
      { x: leftCenterX, y: 0 }, // left-center
    ];
    return positions[index];
  }

  if (totalCards === 6) {
    const positions = [
      { x: 0, y: topCenterY }, // top
      { x: rightCenterX, y: topCenterY / 2 }, // right-top
      { x: rightCenterX, y: bottomCenterY / 2 }, // right-bottom
      { x: 0, y: bottomCenterY }, // bottom
      { x: leftCenterX, y: bottomCenterY / 2 }, // left-bottom
      { x: leftCenterX, y: topCenterY / 2 }, // left-top
    ];
    return positions[index];
  }

  // For 7+ cards, use elliptical distribution
  // Calculate ellipse radii from available space
  const radiusX = (Math.abs(leftCenterX) + Math.abs(rightCenterX)) / 2;
  const radiusY = (Math.abs(topCenterY) + Math.abs(bottomCenterY)) / 2;

  // Start from top (-90°) and distribute clockwise
  const startAngle = -Math.PI / 2;
  const angle = startAngle + (index / totalCards) * 2 * Math.PI;

  return {
    x: radiusX * Math.cos(angle),
    y: radiusY * Math.sin(angle),
  };
};

export const generateCustomInsights = (
  questionId: string,
  input: string,
): InsightCard[] => {
  return [
    {
      id: `${questionId}-answer`,
      insight: `Strategic opportunity for market differentiation`,
      source: 'Possible Answer',
      type: 'data',
      sentiment: 'tailwind',
    },
    {
      id: `${questionId}-1`,
      insight: `Market research shows growing interest in ${input.toLowerCase()}`,
      source: 'industry-reports.com',
      url: 'https://industry-reports.com',
      type: 'research',
      sentiment: 'tailwind',
    },
    {
      id: `${questionId}-2`,
      insight: `Consumer surveys indicate mixed reactions to ${input.toLowerCase()}`,
      source: 'consumer-insights.com',
      url: 'https://consumer-insights.com',
      type: 'data',
      sentiment: 'neutral',
    },
    {
      id: `${questionId}-3`,
      insight: `Implementation challenges around ${input.toLowerCase()} in QSR settings`,
      source: 'operational-studies.com',
      url: 'https://operational-studies.com',
      type: 'research',
      sentiment: 'headwind',
    },
    {
      id: `${questionId}-4`,
      insight: `Early adopters report positive results with ${input.toLowerCase()}`,
      source: 'case-studies.com',
      url: 'https://case-studies.com',
      type: 'example',
      sentiment: 'tailwind',
    },
  ];
};
