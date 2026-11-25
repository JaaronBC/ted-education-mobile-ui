import { useLanguage as useLocale12 } from '@/i18n/LanguageContext';
import AccountSettingsPage from '../../../features/profile/components/AccountSettingsPage';
import EmailChange from '../../../features/profile/components/EmailChange';

export default function ChangeEmailScreen() {
  const { t: t12 } = useLocale12();

  return (
    <AccountSettingsPage
      guestDescription={t12("Sign in to manage your verified email address.")}
    >
      <EmailChange />
    </AccountSettingsPage>
  );
}
