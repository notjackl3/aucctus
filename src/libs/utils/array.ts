import utils from '.';

export function removeMiddleItems<T>(array: T[], n: number): T[] {
  const middleIndex = Math.floor(array.length / 2) - Math.floor(n / 2);
  array.splice(middleIndex, n);
  return array;
}

function createArrayFromRange(startNumber: number, endNumber: number): number[] {
  return Array.from({ length: endNumber - startNumber + 1 }, (_, index) => startNumber + index);
}

export function createPaginationNumbers(
  currentPage: number,
  numberOfPages: number,
  maxPages: number,
): (number | '...')[] {
  if (numberOfPages <= maxPages) return createArrayFromRange(1, numberOfPages);

  const current = utils.number.clamp(currentPage, 1, numberOfPages);

  const startPages = [1];
  const endPages = [numberOfPages];

  const remainingButtons = maxPages - startPages.length - endPages.length;

  console.log(`RemainingButtons: ${remainingButtons}`);

  // TODO: Ensure the current page is in the list
  if (remainingButtons < 0) {
    return [...startPages, '...', ...endPages];
  } else if (remainingButtons === 0) {
    [...startPages, ...endPages];
  }

  // Calculate the middle range, ensuring the current page is centered when possible
  const halfWindow = Math.floor(remainingButtons / 2);
  let middleStart: number;
  let middleEnd: number;

  if (current - halfWindow < 2) {
    middleStart = 2;
    middleEnd = middleStart + remainingButtons - 1;
  } else if (current + halfWindow > numberOfPages - 1) {
    middleEnd = numberOfPages - 1;
    middleStart = middleEnd - remainingButtons + 1;
  } else {
    middleStart = current - halfWindow;
    middleEnd = current + halfWindow;
  }

  // Adjust if middle overlaps with start or end
  if (middleStart <= 2) {
    middleStart = 2;
  }
  if (middleEnd >= numberOfPages - 1) {
    middleEnd = numberOfPages - 1;
  }

  const middlePages: number[] = [];
  for (let i = middleStart; i <= middleEnd; i++) {
    middlePages.push(i);
  }

  // Combine start, middle, and end pages with ellipses
  const pagination: (number | '...')[] = [...startPages];

  if (middleStart > 2) {
    pagination.push('...');
  }

  pagination.push(...middlePages);

  if (middleEnd < numberOfPages - 1) {
    pagination.push('...');
  }

  pagination.push(...endPages);

  return pagination;
}
