import { useLang } from "../i18n/LanguageContext";
import StaticPage from "./StaticPage";

export default function Disclaimer({ onBack }) {
  const { t, lang } = useLang();
  const isHa = lang === "ha";

  return (
    <StaticPage title={t.disclaimerTitle} updated={t.lastUpdated} onBack={onBack}>
      {isHa ? (
        <>
          <p>
            <strong>Fara'id AI kayan aiki ne na ilimi da lissafi, ba fatawa ta
            hukuma ba ce.</strong> Da fatan a karanta wannan bayani a hankali
            kafin ka dogara da sakamakon da app ɗin ya bayar.
          </p>
          <h3 className="font-semibold text-gray-900">Ba Maye Gurbin Malami Ba Ne</h3>
          <p>
            Sakamakon lissafi da app ɗin ke bayarwa ya dogara ne akan
            ra'ayin mafi rinjaye (Hanafi/Shafi'i) na gargajiya. Amma
            shari'o'i na hakika sukan ƙunshi cikakkun bayanai (misali:
            shakku kan mutuwar wani, wasu iyakoki na wasiyya, ko wasu
            yanayi na musamman) waɗanda za su iya canza hukuncin. Ka tuntuɓi
            malamin shari'a mai cancanta kafin ka aiwatar da wani rabon
            dukiya na hakika.
          </p>
          <h3 className="font-semibold text-gray-900">Kurakuran Fasaha</h3>
          <p>
            Ko da yake mun yi ƙoƙarin tabbatar da daidaiton lissafin,
            software na iya samun kurakura ko bug. Ka tabbatar da sakamakon
            ta hanyar wani malami ko ƙwararre kafin ka amince da shi 100%.
          </p>
          <h3 className="font-semibold text-gray-900">Fasalin LLM/AI Support</h3>
          <p>
            Sashin taimako (Support/Guide) da ke amfani da AI yana ba da
            amsoshi ne kawai domin taimakon amfani da app ɗin da bayanan
            ilimi na gabaɗaya game da Fara'id — ba shawarar shari'a ta
            musamman ga yanayinka ba ce. AI ɗin **baya samun** damar ganin
            bayanan cases ɗinka da aka ajiye ko wani bayanin sirri.
          </p>
          <h3 className="font-semibold text-gray-900">Babu Alhaki</h3>
          <p>
            Fara'id AI, masu haɓaka shi, da duk wanda ke da hannu a ciki ba
            za su ɗauki alhakin wata asara, sabani na iyali, ko lahani da ta
            samo asali daga amfani da wannan app ba.
          </p>
        </>
      ) : (
        <>
          <p>
            <strong>Fara'id AI is an educational and computational tool,
            not an official religious ruling (fatwa).</strong> Please read
            this notice carefully before relying on any result the app
            produces.
          </p>
          <h3 className="font-semibold text-gray-900">Not a Substitute for a Scholar</h3>
          <p>
            Results are based on the majority (Hanafi/Shafi'i) classical
            view. Real-world cases often involve details — such as
            uncertainty about time of death, bequest limits, or unusual
            circumstances — that can change the correct ruling. Always
            consult a qualified scholar before acting on any real
            distribution of an estate.
          </p>
          <h3 className="font-semibold text-gray-900">Technical Errors</h3>
          <p>
            While we've worked to keep the calculations accurate, software
            can contain bugs or errors. Verify results with a scholar or
            qualified professional before fully relying on them.
          </p>
          <h3 className="font-semibold text-gray-900">AI Guide / Support Feature</h3>
          <p>
            The AI-powered Support/Guide only provides general help using
            the app and general Fara'id education — not a personalized
            legal ruling for your specific situation. The AI does **not**
            have access to your saved case data or any private information.
          </p>
          <h3 className="font-semibold text-gray-900">No Liability</h3>
          <p>
            Fara'id AI, its developers, and anyone involved in building it
            are not liable for any loss, family dispute, or damage arising
            from the use of this app.
          </p>
        </>
      )}
    </StaticPage>
  );
}
