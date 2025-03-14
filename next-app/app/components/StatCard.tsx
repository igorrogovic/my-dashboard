// components/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  isSelected: boolean;
  isSecondSelected?: boolean; // New prop to track if this is the second selected card
}

export default function StatCard({ title, value, icon, isSelected, isSecondSelected }: StatCardProps) {
  return (
    <div className={`
      p-4 rounded-lg shadow-md transition-all
      ${isSelected 
        ? isSecondSelected
          ? 'bg-purple-100 border-2 border-purple-500' // Purple highlight for second selection
          : 'bg-blue-100 border-2 border-blue-500'     // Blue highlight for first selection
        : 'bg-white hover:bg-gray-50'
      }
    `}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <i className={`fas ${icon} text-gray-400`}></i>
      </div>
      <div className="mt-2 text-2xl font-semibold">
        {value}
      </div>
    </div>
  );
}