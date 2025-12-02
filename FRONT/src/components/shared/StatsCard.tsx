import React from 'react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    color = 'blue'
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="stats-card">
            <div className="stats-card-header">
                {icon && (
                    <div className={`stats-card-icon ${colorClasses[color]}`}>
                        {icon}
                    </div>
                )}
                <div className="stats-card-content">
                    <p className="stats-card-title">{title}</p>
                    <p className="stats-card-value">{value}</p>
                </div>
            </div>
        </div>
    );
};
