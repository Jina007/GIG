import React from 'react';
import { ShieldCheck, UserCheck, Award, FileCheck2, Zap, Repeat } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface TrustBadgeProps {
  type: 'coop' | 'identity' | 'skill' | 'cert' | 'emergency' | 'repeat';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  verified?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  type,
  label,
  size = 'md',
  verified = true,
}) => {
  const { t } = useLanguage();

  if (!verified) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const badgeConfig = {
    coop: {
      defaultLabel: t('cooperativeMember', 'Cooperative Member'),
      icon: ShieldCheck,
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium',
      iconClass: 'text-emerald-600',
    },
    identity: {
      defaultLabel: t('identityVerified', 'Identity Verified'),
      icon: UserCheck,
      classes: 'bg-blue-50 text-blue-800 border-blue-300 font-medium',
      iconClass: 'text-blue-600',
    },
    skill: {
      defaultLabel: t('skillVerified', 'Skill Verified'),
      icon: Award,
      classes: 'bg-indigo-50 text-indigo-800 border-indigo-300 font-medium',
      iconClass: 'text-indigo-600',
    },
    cert: {
      defaultLabel: t('certificateVerified', 'Certificate Verified'),
      icon: FileCheck2,
      classes: 'bg-teal-50 text-teal-800 border-teal-300 font-medium',
      iconClass: 'text-teal-600',
    },
    emergency: {
      defaultLabel: t('emergencyService', 'Emergency Ready'),
      icon: Zap,
      classes: 'bg-amber-50 text-amber-900 border-amber-300 font-bold animate-pulse',
      iconClass: 'text-amber-600',
    },
    repeat: {
      defaultLabel: t('repeatCustomers', 'Community Favorite'),
      icon: Repeat,
      classes: 'bg-purple-50 text-purple-800 border-purple-300 font-medium',
      iconClass: 'text-purple-600',
    },
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${sizeClasses[size]} ${config.classes}`}
    >
      <Icon className={`${iconSizes[size]} ${config.iconClass}`} />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
