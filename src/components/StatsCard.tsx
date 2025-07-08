import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange';
  isStatus?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, isStatus = false }) => {
  const colorClasses = {
    blue: 'bg-blue-500 bg-opacity-20 text-blue-400',
    green: 'bg-green-500 bg-opacity-20 text-green-400',
    purple: 'bg-purple-500 bg-opacity-20 text-purple-400',
    orange: 'bg-orange-500 bg-opacity-20 text-orange-400'
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-white mt-1 ${isStatus && value === 'Running' ? 'text-green-400' : ''}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;