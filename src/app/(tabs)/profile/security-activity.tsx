import { useLanguage as useLocale12 } from '@/i18n/LanguageContext';
import AccountSettingsPage from '../../../features/profile/components/AccountSettingsPage';
import SecurityActivity from '../../../features/profile/components/SecurityActivity';

export default function SecurityActivityScreen() {
  const { t: t12 } = useLocale12();

  return (
    <AccountSettingsPage
      guestDescription={t12("Sign in to review your account security activity.")}
    >
      <SecurityActivity />
    </AccountSettingsPage>
  );
}
