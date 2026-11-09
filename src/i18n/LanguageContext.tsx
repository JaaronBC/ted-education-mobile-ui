import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext, useContext, useEffect, useState,
  type PropsWithChildren
} from 'react';
import { useSession } from '../contexts/SessionContext';

export type Language = 'en'|'zh'|'ja'|'ko'|'es';

export const LANGUAGES: {code:Language;name:string}[] = [
  {code:'en',name:'English'},
  {code:'zh',name:'中文'},
  {code:'ja',name:'日本語'},
  {code:'ko',name:'한국어'},
  {code:'es',name:'Español'}
];

const storage = '@ted/language/v1';
const dict: Record<string,string[]> = {"Welcome":["Welcome","欢迎","ようこそ","환영합니다","Bienvenido"],"Create Account":["Create Account","创建账户","アカウントを作成","계정 만들기","Crear cuenta"],"Create account":["Create account","创建账户","アカウントを作成","계정 만들기","Crear cuenta"],"Sign In":["Sign In","登录","ログイン","로그인","Iniciar sesión"],"Sign in":["Sign in","登录","ログイン","로그인","Iniciar sesión"],"Explore as Guest":["Explore as Guest","以访客身份浏览","ゲストとして見る","게스트로 둘러보기","Explorar como invitado"],"Choose Your Language":["Choose Your Language","选择语言","言語を選択","언어 선택","Elige tu idioma"],"You can change this later in Settings.":["You can change this later in Settings.","之后可在设置中修改。","後から設定で変更できます。","나중에 설정에서 변경할 수 있습니다.","Puedes cambiarlo después en Ajustes."],"Continue":["Continue","继续","続ける","계속","Continuar"],"Back":["Back","返回","戻る","뒤로","Atrás"],"Skip for now":["Skip for now","暂时跳过","今はスキップ","지금은 건너뛰기","Omitir por ahora"],"Maybe later":["Maybe later","以后再说","後で","나중에","Quizás más tarde"],"Home":["Home","首页","ホーム","홈","Inicio"],"Learn":["Learn","学习","学ぶ","학습","Aprender"],"Track":["Track","记录","記録","기록","Seguimiento"],"My Health":["My Health","我的健康","マイヘルス","내 건강","Mi salud"],"Profile":["Profile","个人资料","プロフィール","프로필","Perfil"],"My Profile":["My Profile","我的资料","マイプロフィール","내 프로필","Mi perfil"],"Personal Information":["Personal Information","个人信息","個人情報","개인 정보","Información personal"],"Language":["Language","语言","言語","언어","Idioma"],"Accessibility":["Accessibility","无障碍","アクセシビリティ","접근성","Accesibilidad"],"Two-factor authentication":["Two-factor authentication","双重身份验证","二要素認証","2단계 인증","Autenticación de dos factores"],"Account Security":["Account Security","账户安全","アカウントのセキュリティ","계정 보안","Seguridad de la cuenta"],"Security":["Security","安全","セキュリティ","보안","Seguridad"],"Privacy":["Privacy","隐私","プライバシー","개인정보 보호","Privacidad"],"About":["About","关于","アプリ情報","정보","Acerca de"],"Data Management":["Data Management","数据管理","データ管理","데이터 관리","Gestión de datos"],"Password":["Password","密码","パスワード","비밀번호","Contraseña"],"Email address":["Email address","邮箱地址","メールアドレス","이메일 주소","Correo electrónico"],"Full name":["Full name","姓名","氏名","성명","Nombre completo"],"Enter your full name":["Enter your full name","请输入姓名","氏名を入力","성명을 입력하세요","Introduce tu nombre completo"],"Gender":["Gender","性别","性別","성별","Género"],"Male":["Male","男性","男性","남성","Hombre"],"Female":["Female","女性","女性","여성","Mujer"],"Prefer not to say":["Prefer not to say","不愿透露","回答しない","응답하지 않음","Prefiero no decirlo"],"Save changes":["Save changes","保存修改","変更を保存","변경 사항 저장","Guardar cambios"],"Save":["Save","保存","保存","저장","Guardar"],"Sign out":["Sign out","退出登录","ログアウト","로그아웃","Cerrar sesión"],"Guest":["Guest","访客","ゲスト","게스트","Invitado"],"Signed in":["Signed in","已登录","ログイン中","로그인됨","Sesión iniciada"],"Browsing without an account":["Browsing without an account","正在以访客身份浏览","ゲストで閲覧中","게스트로 둘러보는 중","Explorando sin cuenta"],"PREFERENCES":["PREFERENCES","偏好设置","環境設定","기본 설정","PREFERENCIAS"],"ACCOUNT SECURITY":["ACCOUNT SECURITY","账户安全","アカウントのセキュリティ","계정 보안","SEGURIDAD DE LA CUENTA"],"YOUR DETAILS":["YOUR DETAILS","个人信息","個人情報","내 정보","TUS DATOS"],"PRIVACY & SUPPORT":["PRIVACY & SUPPORT","隐私与支持","プライバシーとサポート","개인정보 및 지원","PRIVACIDAD Y SOPORTE"],"YOUR TED EXPERIENCE":["YOUR TED EXPERIENCE","您的 TED 体验","TED のご利用","TED 경험","TU EXPERIENCIA TED"],"Your name":["Your name","您的姓名","お名前","이름","Tu nombre"],"Make TED yours":["Make TED yours","个性化您的 TED","TED を自分好みに","TED 맞춤 설정","Personaliza TED"],"Protect your account":["Protect your account","保护您的账户","アカウントを保護","계정 보호","Protege tu cuenta"],"Go to TED Home":["Go to TED Home","进入 TED 首页","TED ホームへ","TED 홈으로","Ir al inicio de TED"],"Continue with Google":["Continue with Google","使用 Google 继续","Google で続行","Google로 계속하기","Continuar con Google"],"Forgot password?":["Forgot password?","忘记密码？","パスワードをお忘れですか？","비밀번호를 잊으셨나요?","¿Olvidaste tu contraseña?"],"Reset password":["Reset password","重置密码","パスワードを再設定","비밀번호 재설정","Restablecer contraseña"],"Confirm password":["Confirm password","确认密码","パスワードを確認","비밀번호 확인","Confirmar contraseña"],"Two-factor verification":["Two-factor verification","双重身份验证","二要素認証","2단계 인증","Verificación de dos factores"],"Verify and sign in":["Verify and sign in","验证并登录","認証してログイン","확인 후 로그인","Verificar e iniciar sesión"],"Authenticator 2FA":["Authenticator 2FA","身份验证器双重验证","認証アプリによる二要素認証","인증 앱 2단계 인증","Autenticador 2FA"],"Not enabled":["Not enabled","尚未开启","無効","비활성화","No activado"],"Enabled":["Enabled","已开启","有効","활성화","Activado"],"Confirm & enable":["Confirm & enable","确认并开启","確認して有効化","확인 후 활성화","Confirmar y activar"],"Cancel setup":["Cancel setup","取消设置","設定をキャンセル","설정 취소","Cancelar configuración"],"Recovery codes":["Recovery codes","备用恢复码","リカバリーコード","복구 코드","Códigos de recuperación"],"Step 1 of 3":["Step 1 of 3","第 1 步，共 3 步","ステップ 1/3","1/3단계","Paso 1 de 3"],"Step 2 of 3":["Step 2 of 3","第 2 步，共 3 步","ステップ 2/3","2/3단계","Paso 2 de 3"],"Step 3 of 3":["Step 3 of 3","第 3 步，共 3 步","ステップ 3/3","3/3단계","Paso 3 de 3"],"Optional":["Optional","可选","任意","선택 사항","Opcional"],"Required":["Required","必填","必須","필수","Obligatorio"],"Text size":["Text size","字体大小","文字サイズ","글자 크기","Tamaño del texto"],"High contrast":["High contrast","高对比度","ハイコントラスト","고대비","Alto contraste"],"Finish":["Finish","完成","完了","완료","Finalizar"],"Set up Authenticator":["Set up Authenticator","设置身份验证器","認証アプリを設定","인증 앱 설정","Configurar autenticador"],"Thyroid Eye Disease":["Thyroid Eye Disease","甲状腺眼病","甲状腺眼症","갑상선 안병증","Enfermedad ocular tiroidea"],"Treatment":["Treatment","治疗","治療","치료","Tratamiento"],"Share With My Doctor":["Share With My Doctor","与医生分享","医師と共有","의사와 공유","Compartir con mi médico"]};
const codes: Language[] = ['en','zh','ja','ko','es'];

function normalize(v: string | null | undefined): Language {
  const s=(v??'').toLowerCase();
  if(s.startsWith('zh')) return 'zh';
  if(s.startsWith('ja')||s==='jp') return 'ja';
  if(s.startsWith('ko')||s==='kr') return 'ko';
  if(s.startsWith('es')) return 'es';
  return 'en';
}

type ContextValue = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key:string) => string;
};

const Context=createContext<ContextValue|null>(null);

export function LanguageProvider({children}:PropsWithChildren) {
  const {user,updateAccountProfile}=useSession();

  const [deviceLanguage, update] = useState<Language>('en');

  const [pending, setPending] = useState<{
    owner: string;
    language: Language;
  } | null>(null);

  const [loaded,setLoaded]=useState(false);

  const language: Language = user && user.onboardingCompletedAt
    ? (
        pending?.owner === user.id
          ? pending.language
          : normalize(user.preferredLanguage)
      )
    : deviceLanguage;

  useEffect(()=>{
    let active=true;
    AsyncStorage.getItem(storage)
      .then(value=>{if(active&&value)update(normalize(value));})
      .catch(()=>undefined)
      .finally(()=>{if(active)setLoaded(true);});
    return ()=>{active=false;};
  },[]);

  useEffect(()=>{
    if(loaded)
      void AsyncStorage.setItem(storage,language).catch(()=>undefined);
  },[language,loaded]);

  const setLanguage = async (next: Language) => {
    update(next);

    if (user?.onboardingCompletedAt) {
      setPending({owner: user.id, language: next});
    }

    await AsyncStorage.setItem(storage, next);

    try {
      if (user && user.preferredLanguage !== next) {
        await updateAccountProfile({
          preferredLanguage: next,
        });
      }
    } finally {
      if (user?.onboardingCompletedAt) {
        setPending(previous =>
          previous?.owner === user.id &&
          previous.language === next
            ? null
            : previous
        );
      }
    }
  };

  const t=(key:string)=>dict[key]?.[codes.indexOf(language)]||key;

  return <Context.Provider value={{language,setLanguage,t}}>
    {children}
  </Context.Provider>;
}

export function useLanguage() {
  const context=useContext(Context);
  if(!context)throw Error('LanguageProvider missing');
  return context;
}
