import React from 'react';

interface SettingsSectionProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
  showDivider?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ icon, label, description, children, showDivider = true }) => {
  return (
    <div className={`flex items-center justify-between py-6 ${showDivider ? 'border-b border-gray-100 dark:border-slate-800' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/5 rounded-2xl text-primary">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="font-manrope font-black text-lg dark:text-white">{label}</span>
          {description && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{description}</span>}
        </div>
      </div>
      <div className="flex items-center">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;
