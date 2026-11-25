import { useLanguage as useLocale12 } from '@/i18n/LanguageContext';
import AccountSettingsPage from '../../../features/profile/components/AccountSettingsPage';
import ConnectedAccounts from '../../../features/profile/components/ConnectedAccounts';

export default function ConnectedAccountsScreen() {
  const { t: t12 } = useLocale12();

  return (
    <AccountSettingsPage
      guestDescription={t12("Sign in to manage your connected accounts.")}
    >
      <ConnectedAccounts />
    </AccountSettingsPage>
  );
}
