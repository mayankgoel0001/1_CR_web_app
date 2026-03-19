import React from 'react';

/**
 * Reusable KPI Card component for dashboards and detail pages.
 * 
 * @param {Object} props
 * @param {string} props.label - The title/heading of the card (will be black).
 * @param {string|number|React.ReactNode} props.value - The main numeric/data value.
 * @param {React.ReactNode} props.icon - Icon element (typically from Md or ICONS).
 * @param {string} [props.subText] - Secondary text at the bottom.
 * @param {React.ReactNode} [props.badge] - Optional pill/trend badge below the value.
 * @param {boolean} [props.dark] - If true, applies the premium dark gradient/border (e.g. for Net Worth).
 * @param {string} [props.valueColor] - Custom color for the main value text (Tailwind class).
 * @param {string} [props.iconBg] - Custom background class for the icon container (Tailwind class).
 * @param {string} [props.iconColor] - Custom color class for the icon (Tailwind class).
 */
const KPICard = ({ 
    label, 
    value, 
    icon, 
    subText, 
    badge, 
    dark = false, 
    valueColor = 'text-[#0D1F17]',
    iconBg = 'bg-[rgba(45,122,79,0.08)]',
    iconColor = 'text-[#2D7A4F]'
}) => {
    const containerClasses = dark 
        ? "bg-gradient-to-br from-[rgba(45,122,79,0.12)] to-[rgba(45,122,79,0.05)] border border-[rgba(45,122,79,0.24)] shadow-sm rounded-[14px] p-6 flex flex-col relative transition-shadow duration-200 hover:shadow-md"
        : "bg-white border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] rounded-[14px] p-6 flex flex-col relative transition-shadow duration-200 hover:shadow-md h-full";

    return (
        <article className={containerClasses}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-black uppercase tracking-[0.8px]">{label}</span>
                <div className={`w-[34px] h-[34px] rounded-md flex items-center justify-center text-[18px] flex-shrink-0 ${iconBg} ${iconColor}`}>
                    {icon}
                </div>
            </div>
            
            <div className={`text-[26px] font-bold leading-tight tracking-tight ${valueColor}`}>
                {value}
            </div>

            {badge && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {badge}
                </div>
            )}

            {subText && (
                <div className="text-[12px] mt-auto pt-2 text-[#8FA99C] font-medium leading-tight">
                    {subText}
                </div>
            )}
        </article>
    );
};

export default KPICard;
