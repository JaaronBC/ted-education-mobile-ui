import { useLanguage as useLocale12 } from '@/i18n/LanguageContext';
import AccountSettingsPage from '../../../features/profile/components/AccountSettingsPage';
import SessionManager from '../../../features/profile/components/SessionManager';

export default function DevicesScreen() {
  const { t: t12 } = useLocale12();

  return (
    <AccountSettingsPage
      guestDescription={t12("Sign in to review and manage your active sessions.")}
    >
      <SessionManager />
    </AccountSettingsPage>
  );
}
