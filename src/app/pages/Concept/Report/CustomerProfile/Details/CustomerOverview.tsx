import defaultAvatar from '@assets/img/avatar.png';
import { ICustomerProfile } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { CSSProperties, forwardRef, useCallback, useMemo } from 'react';
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  GraduationCap,
} from 'lucide-react';

interface CustomerOverviewProps {
  profile: ICustomerProfile;
  overviewExpanded: boolean;
  setOverviewExpanded: (expanded: boolean) => void;
  className?: string;
}

// Extend ICustomerProfile for optional fields not yet in the backend
interface ExtendedCustomerProfile extends ICustomerProfile {
  educationLevel?: string;
  occupation?: string;
  themeColor?: string;
}

const CustomerOverview = forwardRef<HTMLDivElement, CustomerOverviewProps>(
  ({ profile, overviewExpanded, setOverviewExpanded, className }, ref) => {
    const extendedProfile = profile as ExtendedCustomerProfile;

    const formatIncome = useCallback((income: number) => {
      if (income < 1000) {
        return `$${income}K`;
      }
      return `$${Math.round(income / 1000)}K`;
    }, []);

    const incomeDisplay =
      profile?.incomeLower || profile?.incomeUpper
        ? `${profile.incomeLower ? formatIncome(profile.incomeLower) : '?'}-${profile.incomeUpper ? formatIncome(profile.incomeUpper) : '?'}`
        : null;

    // Build demographic pills from available data
    const pills: { icon: React.ReactNode; label: string }[] = [];
    if (profile?.geoLocation) {
      pills.push({
        icon: <MapPin size={12} />,
        label: profile.geoLocation,
      });
    }
    if (profile?.ageRange) {
      pills.push({
        icon: <Calendar size={12} />,
        label: profile.ageRange,
      });
    }
    if (incomeDisplay) {
      pills.push({
        icon: <DollarSign size={12} />,
        label: incomeDisplay,
      });
    }
    if (profile?.familySize) {
      pills.push({
        icon: <Users size={12} />,
        label: `Family of ${profile.familySize}`,
      });
    }
    if (extendedProfile?.educationLevel) {
      pills.push({
        icon: <GraduationCap size={12} />,
        label: extendedProfile.educationLevel,
      });
    }
    if (extendedProfile?.occupation) {
      pills.push({
        icon: <Briefcase size={12} />,
        label: extendedProfile.occupation,
      });
    }

    const heroTintStyle = useMemo<CSSProperties>(() => {
      if (extendedProfile?.themeColor) {
        return {
          background: `radial-gradient(circle at left center, hsl(${extendedProfile.themeColor} / 0.18) 0%, hsl(${extendedProfile.themeColor} / 0.08) 38%, transparent 72%)`,
        };
      }

      return {
        background:
          'radial-gradient(circle at left center, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0.07) 38%, transparent 72%)',
      };
    }, [extendedProfile?.themeColor]);

    const heroImageBleedStyle = useMemo<CSSProperties | undefined>(() => {
      if (!profile?.avatarUrl || extendedProfile?.themeColor) {
        return undefined;
      }

      return {
        backgroundImage: `url(${profile.avatarUrl})`,
        backgroundPosition: 'left center',
        backgroundSize: '145% 145%',
        filter: 'blur(42px) saturate(135%)',
        opacity: 0.28,
        transform: 'scale(1.08)',
      };
    }, [extendedProfile?.themeColor, profile?.avatarUrl]);

    // heroWashStyle replaced with Tailwind dark-mode-aware gradient below

    return (
      <div ref={ref} className={cn('flex h-full flex-col', className)}>
        {/* Hero section */}
        <div className='flex h-[200px] overflow-hidden'>
          {/* Left: Avatar */}
          <div className='aucctus-bg-secondary aucctus-border-secondary w-60 flex-shrink-0 border-r'>
            <img
              src={profile?.avatarUrl || defaultAvatar}
              alt={profile?.name || 'avatar'}
              className='h-full w-full object-cover'
            />
          </div>

          {/* Right: Title area */}
          <div className='relative flex flex-1 overflow-hidden px-8 py-6'>
            <div aria-hidden className='pointer-events-none absolute inset-0'>
              <div className='absolute inset-0' style={heroTintStyle} />
              {heroImageBleedStyle && (
                <div className='absolute inset-0' style={heroImageBleedStyle} />
              )}
              <div className='absolute inset-0 bg-gradient-to-r from-white/20 via-white/70 to-white/95 dark:from-black/20 dark:via-black/70 dark:to-black/95' />
            </div>

            <div className='relative z-10 flex flex-1 flex-col justify-center'>
              {profile?.isPrimary && (
                <div className='mb-2 flex'>
                  <span className='aucctus-bg-brand-secondary aucctus-text-brand-tertiary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium'>
                    <Briefcase size={12} />
                    Primary
                  </span>
                </div>
              )}
              <h2 className='aucctus-text-primary text-3xl font-semibold'>
                {profile?.segment || 'Customer Segment'}
              </h2>
              <p className='aucctus-text-tertiary mt-1.5 text-lg'>
                Represented by {profile?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Demographics pills */}
        {pills.length > 0 && (
          <div className='flex flex-wrap gap-2 px-6 pt-5'>
            {pills.map((pill, i) => (
              <span
                key={i}
                className='aucctus-text-secondary aucctus-border-secondary bg-muted/60 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium'
              >
                {pill.icon}
                {pill.label}
              </span>
            ))}
          </div>
        )}

        {/* Overview text with "See more" toggle */}
        {profile?.description && (
          <div className='flex flex-1 flex-col px-6 pb-5 pt-4'>
            <h3 className='aucctus-text-secondary aucctus-text-md-medium mb-2 uppercase tracking-wider'>
              OVERVIEW
            </h3>
            <p
              className={cn(
                'aucctus-text-secondary aucctus-text-md hyphens-auto break-words',
                !overviewExpanded && 'line-clamp-4',
              )}
            >
              {profile.description}
            </p>
            {profile.description.length > 280 && (
              <button
                onClick={() => setOverviewExpanded(!overviewExpanded)}
                className='aucctus-text-brand-primary mt-2 inline-flex items-center gap-1 self-start text-xs font-medium opacity-80 transition-opacity hover:opacity-100'
              >
                {overviewExpanded ? (
                  <>
                    Show less <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    See more <ChevronDown size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);

CustomerOverview.displayName = 'CustomerOverview';

export default CustomerOverview;
