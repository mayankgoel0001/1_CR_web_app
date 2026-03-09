import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const DEFAULT_COLORS = [
    '#4285F4', '#34A853', '#FBBC04', '#EA4335', '#A142F4',
    '#24C1E0', '#F538A0', '#FF6D01', '#1A73E8', '#0D652D',
    '#E37400', '#D93025', '#9334E6', '#12B5CB', '#C5221F',
    '#E8710A',
];

const RADIAN = Math.PI / 180;

/**
 * Custom label — only shows for slices >= 1.5% to avoid overlap.
 * Small slices are covered by the legend below the chart.
 */
function renderCustomLabel(props, colors) {
    const { cx, cy, midAngle, outerRadius, percent, name, index } = props;
    if (percent < 0.015) return null;

    const fill = colors[index % colors.length];
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);

    const sx = cx + (outerRadius + 4) * cos;
    const sy = cy + (outerRadius + 4) * sin;
    const mx = cx + (outerRadius + 22) * cos;
    const my = cy + (outerRadius + 22) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 16;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    const percentStr = `${(percent * 100).toFixed(1)}%`;

    return (
        <g>
            <path
                d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                stroke={fill}
                fill="none"
                strokeWidth={1.2}
            />
            <text
                x={ex + (cos >= 0 ? 5 : -5)}
                y={ey - 5}
                textAnchor={textAnchor}
                fill="#6B7280"
                fontSize={10}
                fontFamily="Inter, sans-serif"
            >
                {name}
            </text>
            <text
                x={ex + (cos >= 0 ? 5 : -5)}
                y={ey + 9}
                textAnchor={textAnchor}
                fill="#111827"
                fontSize={11}
                fontWeight={700}
                fontFamily="Inter, sans-serif"
            >
                {percentStr}
            </text>
        </g>
    );
}

/**
 * Compact legend showing all items with color dot, name, and percentage.
 */
function CompactLegend({ data, colors }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return null;

    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '6px 16px',
                marginTop: '8px',
                padding: '0 8px',
            }}
        >
            {data.map((item, i) => {
                const pct = ((item.value / total) * 100).toFixed(1);
                return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: colors[i % colors.length],
                                flexShrink: 0,
                            }}
                        />
                        <span style={{ fontSize: '10px', color: '#6B7280', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
                            {item.name}
                        </span>
                        <span style={{ fontSize: '10px', color: '#111827', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
                            {pct}%
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Custom tooltip matching the reference design
 */
function CustomTooltip({ active, payload, totalValue, tooltipSub, tooltipFmt }) {
    if (!active || !payload || !payload.length) return null;
    const { name, value } = payload[0];
    const percent = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
    const displayValue = tooltipFmt ? tooltipFmt(value) : value.toLocaleString();

    return (
        <div
            style={{
                backgroundColor: '#1F2937',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                padding: '12px 18px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                minWidth: '140px',
                fontFamily: 'Inter, sans-serif',
            }}
        >
            <div style={{ color: '#E5E7EB', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>
                {name}
            </div>
            {tooltipSub && (
                <div style={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '4px' }}>
                    {tooltipSub}
                </div>
            )}
            <div style={{ color: '#E5E7EB', fontWeight: 700, fontSize: '16px', marginTop: '4px' }}>
                {displayValue} ({percent}%)
            </div>
        </div>
    );
}

/**
 * Reusable DonutChart with labels for large slices + legend for all items.
 */
export default function DonutChart({
    data,
    centerLabel,
    centerSub,
    colors = DEFAULT_COLORS,
    height = 340,
    innerR = 65,
    outerR = 95,
    tooltipFmt,
    tooltipSub,
    hideLabels = false,
    hideLegend = false,
}) {
    const filteredData = data.filter((d) => d.value > 0);
    const totalValue = filteredData.reduce((s, d) => s + d.value, 0);

    return (
        <div style={{ width: '100%', height, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {centerLabel && (
                <div
                    style={{
                        position: 'absolute',
                        top: '42%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        zIndex: 1,
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    <div style={{ color: '#1F2937', fontWeight: 800, fontSize: '16px', lineHeight: 1.2 }}>
                        {centerLabel}
                    </div>
                    {centerSub && (
                        <div style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>
                            {centerSub}
                        </div>
                    )}
                </div>
            )}

            {/* Chart */}
            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filteredData}
                            cx="50%"
                            cy="48%"
                            innerRadius={innerR}
                            outerRadius={outerR}
                            dataKey="value"
                            paddingAngle={2}
                            stroke="none"
                            label={hideLabels ? false : (props) => renderCustomLabel(props, colors)}
                            labelLine={false}
                            isAnimationActive={true}
                            animationDuration={500}
                        >
                            {filteredData.map((_, i) => (
                                <Cell key={i} fill={colors[i % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={
                                <CustomTooltip
                                    totalValue={totalValue}
                                    tooltipSub={tooltipSub || centerSub}
                                    tooltipFmt={tooltipFmt}
                                />
                            }
                            wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                            isAnimationActive={false}
                            allowEscapeViewBox={{ x: true, y: true }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {!hideLegend && <CompactLegend data={filteredData} colors={colors} />}
        </div>
    );
}
