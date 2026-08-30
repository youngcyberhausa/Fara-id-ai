import { useLang } from "../i18n/LanguageContext";
import StaticPage from "./StaticPage";

export default function PrivacyPolicy({ onBack }) {
  const { t, lang } = useLang();
  const isHa = lang === "ha";

  return (
    <StaticPage title={t.privacyTitle} updated={t.lastUpdated} onBack={onBack}>
      {isHa ? (
        <>
          <p>
            Wannan manufar sirri tana bayyana yadda Fara'id AI ke tattarawa,
            amfani, da kiyaye bayananka.
          </p>
          <h3 className="font-semibold text-gray-900">1. Bayanan da Muke Tattarawa</h3>
          <p>
            Muna tattara: (a) email da sunanka lokacin da ka yi rajista, (b)
            bayanan cases da ka shigar (dukiya, magada, bashi) idan ka zaɓi
            ajiye su, da (c) bayanan fasaha na asali kamar loga na server
            domin gyara matsaloli.
          </p>
          <h3 className="font-semibold text-gray-900">2. Yadda Muke Amfani da Bayanai</h3>
          <p>
            Muna amfani da bayananka don: gudanar da account ɗinka, ajiye da
            dawo da cases ɗinka, inganta sabis ɗin, da amsa tambayoyinka idan
            ka tuntuɓe mu.
          </p>
          <h3 className="font-semibold text-gray-900">3. Rabawa da Wasu</h3>
          <p>
            Ba mu sayar da bayananka ga wasu. Muna raba bayanai kawai da masu
            bayar da sabis da muke amfani da su don gudanar da app ɗin
            (misali, mai karɓar hosting na server), waɗanda ke ƙarƙashin
            wajibcin sirri.
          </p>
          <h3 className="font-semibold text-gray-900">4. Google Sign-In</h3>
          <p>
            Idan ka zaɓi shiga ta Google, muna karɓan email, suna, da ID na
            asali daga Google kawai domin gane account ɗinka — ba mu samun
            damar ganin password ɗin Google ɗinka.
          </p>
          <h3 className="font-semibold text-gray-900">5. Tsaro</h3>
          <p>
            Muna adana password ɗinka a matsayin hash (ba a bayyane ba) kuma
            muna amfani da haɗin gwiwar HTTPS don kiyaye bayanan da ake tura
            tsakanin na'urarka da server ɗinmu.
          </p>
          <h3 className="font-semibold text-gray-900">6. Haƙƙinka</h3>
          <p>
            Za ka iya tambayarmu mu goge account ɗinka da duk cases ɗinka a
            kowane lokaci ta hanyar tuntuɓarmu.
          </p>
        </>
      ) : (
        <>
          <p>
            This privacy policy explains how Fara'id AI collects, uses, and
            protects your information.
          </p>
          <h3 className="font-semibold text-gray-900">1. Information We Collect</h3>
          <p>
            We collect: (a) your email and name when you register, (b) case
            details you enter (estate value, heirs, debts) if you choose to
            save them, and (c) basic technical information such as server
            logs for troubleshooting.
          </p>
          <h3 className="font-semibold text-gray-900">2. How We Use Information</h3>
          <p>
            We use your information to: manage your account, save and
            retrieve your cases, improve the service, and respond if you
            contact us.
          </p>
          <h3 className="font-semibold text-gray-900">3. Sharing with Others</h3>
          <p>
            We do not sell your information. We only share data with service
            providers we use to run the app (such as our server hosting
            provider), who are bound by confidentiality obligations.
          </p>
          <h3 className="font-semibold text-gray-900">4. Google Sign-In</h3>
          <p>
            If you choose to sign in with Google, we only receive your email,
            name, and a unique ID from Google to identify your account — we
            never have access to your Google password.
          </p>
          <h3 className="font-semibold text-gray-900">5. Security</h3>
          <p>
            We store your password as a one-way hash (never in plain text)
            and use HTTPS encryption to protect data sent between your device
            and our server.
          </p>
          <h3 className="font-semibold text-gray-900">6. Your Rights</h3>
          <p>
            You may ask us to delete your account and all your saved cases at
            any time by contacting us.
          </p>
        </>
      )}
    </StaticPage>
  );
}
