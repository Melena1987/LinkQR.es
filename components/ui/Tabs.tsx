import React from 'react';
import { clsx } from 'clsx';
import { TabType } from '../../types';

interface TabsProps {
  current: TabType;
  onChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string }[] = [
  { id: 'content', label: 'Contenido' },
  { id: 'design', label: 'Diseño' },
  { id: 'templates', label: 'Plantillas' },
];

export const Tabs: React.FC<TabsProps> = ({ current, onChange }) => {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap',
            current === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};