import React from 'react';
import { IInvestor } from '@libs/api/types';

interface InvestorsLineChartProps {
  data: IInvestor[];
  selected: IInvestor | null;
}

const InvestorsLineChart: React.FC<InvestorsLineChartProps> = ({
  data,
  selected,
}) => {
  // 1) Helper to generate all months between two dates.
  const getMonthsBetween = (startDate: string, endDate: string) => {
    const [startYear, startMonth] = startDate.split('-').map(Number);
    const [endYear, endMonth] = endDate.split('-').map(Number);
    const dates = [];
    let currentYear = startYear;
    let currentMonth = startMonth;
    while (
      currentYear < endYear ||
      (currentYear === endYear && currentMonth <= endMonth)
    ) {
      const formattedMonth = String(currentMonth).padStart(2, '0');
      dates.push(`${currentYear}-${formattedMonth}`);
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }
    return dates;
  };

  // 2) Sort data by date and get the range of months.
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(a.investmentDate).getTime() -
      new Date(b.investmentDate).getTime(),
  );

  const firstDate = sortedData[0].investmentDate;
  const lastDate = sortedData[sortedData.length - 1].investmentDate;
  const allMonths = getMonthsBetween(firstDate, lastDate);

  // 3) Build cumulative data with all months included.
  const cumulativeData = allMonths.reduce<
    { dateLabel: string; originalDate: string; amount: number }[]
  >((acc, month, index) => {
    const matchingInvestment = sortedData.find(
      (inv) => inv.investmentDate === month,
    );
    const previousAmount = index > 0 ? acc[index - 1].amount : 0;
    acc.push({
      dateLabel: new Date(month + '-01').toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      originalDate: matchingInvestment?.investmentDate ?? '',
      amount: matchingInvestment
        ? previousAmount + matchingInvestment.investedAmount
        : previousAmount,
    });
    return acc;
  }, []);

  // -- CHART DIMENSIONS / MARGINS --
  const width = 600;
  const height = 350;
  const margin = { top: 20, right: 30, bottom: 40, left: 30 };

  // -- FIND DATA EXTENTS --
  const amounts = cumulativeData.map((d) => d.amount);
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);
  const numPoints = cumulativeData.length;

  const getX = (index: number) => {
    if (numPoints <= 1) {
      return (width - margin.left - margin.right) / 2;
    }
    return (
      margin.left +
      (index / (numPoints - 1)) * (width - margin.left - margin.right)
    );
  };

  const getY = (amount: number) => {
    if (maxAmount === minAmount) {
      return height / 2;
    }
    return (
      height -
      margin.bottom -
      ((amount - minAmount) / (maxAmount - minAmount)) *
        (height - margin.top - margin.bottom)
    );
  };

  const points = cumulativeData.map((d, i) => ({
    x: getX(i),
    y: getY(d.amount),
    originalDate: d.originalDate,
    label: d.dateLabel,
  }));

  const createCurvePath = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q ${pts[i].x},${pts[i].y} ${xc},${yc}`;
    }
    d += ` T ${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
    return d;
  };

  const pathD = createCurvePath(points);

  // Optional: horizontal grid lines
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const value = minAmount + ((maxAmount - minAmount) / 4) * i;
    const y = getY(value);
    return { y, value: value.toFixed(0) };
  });

  // -- Helpers for x-axis labeling:
  const getYearMonth = (dateStr: string) => {
    const [y, m] = dateStr.split('-').map(Number);
    return { year: y, month: m };
  };

  const getQuartersBetween = (startDate: string, endDate: string) => {
    const { year: startYear, month: startMonth } = getYearMonth(startDate);
    const { year: endYear, month: endMonth } = getYearMonth(endDate);
    const startQuarter = Math.ceil(startMonth / 3);
    const endQuarter = Math.ceil(endMonth / 3);

    const labels = [];
    let currYear = startYear;
    let currQ = startQuarter;

    while (
      currYear < endYear ||
      (currYear === endYear && currQ <= endQuarter)
    ) {
      labels.push({ label: `Q${currQ} ${currYear}` });
      currQ++;
      if (currQ > 4) {
        currQ = 1;
        currYear++;
      }
    }
    return labels;
  };

  const getSemestersBetween = (startDate: string, endDate: string) => {
    const { year: startYear, month: startMonth } = getYearMonth(startDate);
    const { year: endYear, month: endMonth } = getYearMonth(endDate);

    const startSemester = startMonth <= 6 ? 1 : 2;
    const endSemester = endMonth <= 6 ? 1 : 2;
    const semesters = [];
    let currentYear = startYear;
    let currentSemester = startSemester;
    while (
      currentYear < endYear ||
      (currentYear === endYear && currentSemester <= endSemester)
    ) {
      semesters.push({
        label: `S${currentSemester} ${currentYear}`,
      });
      currentSemester++;
      if (currentSemester > 2) {
        currentSemester = 1;
        currentYear++;
      }
    }
    return semesters;
  };

  const getYearsBetween = (startDate: string, endDate: string) => {
    const { year: startYear } = getYearMonth(startDate);
    const { year: endYear } = getYearMonth(endDate);
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push({ label: String(y) });
    }
    return years;
  };

  /**
   * Decide whether to show quarters, semesters, or years based on difference in years:
   *   - if difference < 2 => quarters
   *   - else if difference > 5 => years
   *   - else => semesters
   */
  const getXAxisLabels = (start: string, end: string) => {
    const { year: startYear } = getYearMonth(start);
    const { year: endYear } = getYearMonth(end);
    const diff = endYear - startYear;

    if (diff < 2) {
      return getQuartersBetween(start, end);
    } else if (diff > 5) {
      return getYearsBetween(start, end);
    } else {
      return getSemestersBetween(start, end);
    }
  };

  const xAxisLabels = getXAxisLabels(firstDate, lastDate);

  return (
    <div className='mx-auto w-full p-4'>
      <svg
        className='h-auto w-full'
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio='xMidYMid meet'
      >
        {/* Grid Lines */}
        {gridLines.map((grid, i) => (
          <g key={i}>
            <line
              x1={margin.left}
              y1={grid.y}
              x2={width - margin.right}
              y2={grid.y}
              stroke='#E5E7EB'
              strokeWidth={1}
              strokeDasharray='2,2'
            />
          </g>
        ))}

        {/* X-Axis Labels */}
        {xAxisLabels.map((item, i) => {
          let xPos = margin.left;
          if (xAxisLabels.length > 1) {
            xPos =
              margin.left +
              (i / (xAxisLabels.length - 1)) *
                (width - margin.left - margin.right);
          }
          return (
            <g key={i}>
              <text
                x={xPos}
                y={height - margin.bottom + 30}
                textAnchor='middle'
                fill='#535862'
                fontSize='10px'
                fontWeight='normal'
                fontFamily='Inter, sans-serif'
              >
                {item.label}
              </text>
            </g>
          );
        })}

        {/* Line Path */}
        <path
          d={pathD}
          fill='none'
          className='stroke-indigo-600'
          strokeWidth={2}
        />

        {/* Points */}
        {points.map((pt, i) => {
          // Find all investors who invested on this date
          const matchingInvestors = data.filter(
            (inv) => inv.investmentDate === pt.originalDate,
          );
          if (matchingInvestors.length === 0) {
            return null;
          }

          // Determine if this point is "selected"
          const isSelected = selected?.investmentDate === pt.originalDate;

          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r={15} fill='#DEE7FC' />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={9}
                className={isSelected ? 'fill-indigo-600' : 'fill-blue-200'}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default InvestorsLineChart;
