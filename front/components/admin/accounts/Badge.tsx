const Badge = ({ text, className }: { text: string, className: string }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border shadow-sm ${className}`}>
        {text}
    </span>
);
export default Badge;   