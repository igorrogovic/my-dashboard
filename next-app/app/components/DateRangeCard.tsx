// components/DateRangeCard.tsx
interface DateRangeCardProps {
    days: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
  }
  
  export default function DateRangeCard({ days, label, isSelected, onClick }: DateRangeCardProps) {
    return (
      <div
        onClick={onClick}
        className={`cursor-pointer p-4 rounded-lg shadow-sm transition-all duration-200 ${
          isSelected 
            ? 'bg-blue-500 text-white' 
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="text-lg font-semibold">{label}</div>
      </div>
    );
  }