import { useLang } from "../i18n/LanguageContext";
import StaticPage from "./StaticPage";

export default function AboutUs({ onBack }) {
  const { t, lang } = useLang();
  const isHa = lang === "ha";

  return (
    <StaticPage title={t.aboutTitle} onBack={onBack}>
      {isHa ? (
        <>
          <p>
            Fara'id AI kayan aiki ne da ke taimaka wa iyalai da masu gudanar da
            gado su rarraba dukiyar mamaci daidai da hukuncin Fara'id na
            Musulunci — cikin sauƙi, a hankali, mataki-mataki.
          </p>
          <p>
            Manufarmu ita ce sanya ilimin gado na Musulunci ya kasance mai
            sauƙin isa ga kowa, ba tare da ya maye gurbin shawarar malamin
            shari'a ba. Tsarin lissafinmu yana bin ra'ayin mafi rinjaye
            (Hanafi/Shafi'i) da aka gada daga Salaf, kuma muna nuna dalilai
            daga Alƙur'ani da Sunnah tare da kowane sakamako, domin ku iya
            duba kanku ku tabbata.
          </p>
          <p>
            Ana ci gaba da haɓaka Fara'id AI, kuma muna maraba da ra'ayoyi da
            shawarwari daga malamai da masu amfani domin mu inganta shi.
          </p>
        </>
      ) : (
        <>
          <p>
            Fara'id AI is a tool that helps families and estate administrators
            distribute a deceased person's estate correctly according to
            Islamic inheritance (Fara'id) law — clearly, and step by step.
          </p>
          <p>
            Our goal is to make Islamic inheritance knowledge accessible to
            everyone, without replacing the advice of a qualified scholar.
            Our calculation engine follows the majority (Hanafi/Shafi'i)
            rulings transmitted through the Salaf, and we show the Qur'anic
            and Sunnah evidence behind every result so you can verify it
            yourself.
          </p>
          <p>
            Fara'id AI is under active development, and we welcome feedback
            from scholars and users to help us improve it.
          </p>
        </>
      )}
    </StaticPage>
  );
}
