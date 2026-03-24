import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  as: Tag = 'div',
}) => (
  <Tag
    className={[
      'rounded-xl bg-white/5 border border-white/10 p-5',
      className,
    ].join(' ')}
  >
    {children}
  </Tag>
);

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="ml-4 shrink-0">{action}</div>}
  </div>
);
