import { useLang } from "../i18n/LanguageContext";
import StaticPage from "./StaticPage";

export default function Learn({ onBack }) {
  const { t, lang } = useLang();
  const isHa = lang === "ha";

  return (
    <StaticPage title={t.learnTitle} onBack={onBack}>
      {isHa ? (
        <>
          <p>
            Fara'id (فرائض) shine ilimin da ke bayyana yadda ake rarraba
            dukiyar mamaci a Musulunci. Allah Ya ƙayyade rabon kansa a cikin
            Alƙur'ani (Suratul Nisa'i, aya 11, 12, da 176), don haka ba wani
            zaɓi ba ne ga iyali su yanke shawarar rabon kansu.
          </p>

          <h3 className="font-semibold text-gray-900">1. Abin da ake yi kafin Rabo</h3>
          <p>
            Kafin a raba gado, dole a fara: (a) biya kudin jana'iza da ya
            dace, (b) biya duk bashin da mamaci ke bin wani, sannan (c) a
            aiwatar da wasiyya (idan akwai) har zuwa kashi ɗaya bisa uku na
            dukiyar da ta rage.
          </p>

          <h3 className="font-semibold text-gray-900">2. Nau'o'in Magada</h3>
          <p>
            <strong>Ashabul Furud</strong> — waɗanda Alƙur'ani ya ƙayyade
            musu takamaiman rabo (misali 1/2, 1/4, 1/8, 1/3, 1/6, 2/3), kamar
            miji, mata, uwa, da 'ya'ya mata.
          </p>
          <p>
            <strong>Asaba</strong> — waɗanda ke karɓan ragowar dukiya bayan
            an biya Ashabul Furud, galibi 'ya'ya maza da danginsu na kusa.
          </p>

          <h3 className="font-semibold text-gray-900">3. Hujb (Cirewa)</h3>
          <p>
            Wasu magada suna hana wasu daga gado gaba ɗaya ko kuma su rage
            rabonsu, dangane da kusanci. Misali, idan akwai ɗa namiji, ba a
            baiwa 'yan'uwan mamaci komai, domin ɗa ya fi kusanci.
          </p>

          <h3 className="font-semibold text-gray-900">4. 'Awl da Radd</h3>
          <p>
            <strong>'Awl</strong> shine idan jimillar rabe-raben da aka
            ƙayyade suka wuce dukiyar da ke akwai — sai a rage kowanne rabo
            daidai gwargwado. <strong>Radd</strong> kuma shine idan akwai
            saura bayan an biya duk Ashabul Furud kuma babu Asaba — sai a
            koma wa Ashabul Furud (in ban da miji/mata) bisa gwargwadon
            rabonsu.
          </p>

          <h3 className="font-semibold text-gray-900">5. Me Ya Sa Fara'id AI?</h3>
          <p>
            Lissafin gado na iya zama mai wahala, musamman idan akwai magada
            da yawa da yanayi masu sarƙaƙiya. Fara'id AI yana taimaka maka ka
            lissafta daidai, tare da nuna dalilan Alƙur'ani da Sunnah da ke
            bayan kowane rabo — amma ba maye gurbin malamin shari'a ba ne;
            don shari'o'i masu sarƙaƙiya, ko a nan hakikanin gado, ka tuntuɓi
            malami.
          </p>
        </>
      ) : (
        <>
          <p>
            Fara'id (فرائض) is the branch of Islamic law that governs how a
            deceased person's estate is distributed. Allah Himself specified
            the shares in the Qur'an (Surah An-Nisa, verses 11, 12, and 176),
            so it isn't left to a family's own discretion.
          </p>

          <h3 className="font-semibold text-gray-900">1. Before Distribution</h3>
          <p>
            Before the estate is divided: (a) reasonable funeral costs are
            paid first, (b) all of the deceased's outstanding debts are
            settled, and (c) any wasiyyah (bequest) is honored, up to a
            maximum of one-third of what remains.
          </p>

          <h3 className="font-semibold text-gray-900">2. Types of Heirs</h3>
          <p>
            <strong>Ashab al-Furud</strong> — heirs given a fixed share by
            the Qur'an (e.g. 1/2, 1/4, 1/8, 1/3, 1/6, 2/3), such as a spouse,
            mother, or daughters.
          </p>
          <p>
            <strong>Asaba</strong> — residuary heirs who take whatever
            remains after the fixed shares are paid, typically sons and
            their close male relatives.
          </p>

          <h3 className="font-semibold text-gray-900">3. Hajb (Exclusion)</h3>
          <p>
            Some heirs block others from inheriting at all, or reduce their
            share, depending on closeness to the deceased. For example, a
            surviving son excludes the deceased's siblings entirely, since
            the son is a closer relative.
          </p>

          <h3 className="font-semibold text-gray-900">4. 'Awl and Radd</h3>
          <p>
            <strong>'Awl</strong> happens when the fixed shares add up to
            more than the whole estate — every share is then proportionally
            reduced to fit. <strong>Radd</strong> happens when there's estate
            left over after paying all fixed-share heirs and there's no
            residuary heir — the surplus is returned to those heirs
            (excluding spouses) in proportion to their shares.
          </p>

          <h3 className="font-semibold text-gray-900">5. Why Fara'id AI?</h3>
          <p>
            Inheritance calculations can get complicated, especially with
            many heirs or unusual combinations. Fara'id AI helps you
            calculate accurately, showing the Qur'anic and Sunnah evidence
            behind every share — but it does not replace a qualified
            scholar; for complex or real-world cases, please consult one.
          </p>
        </>
      )}
    </StaticPage>
  );
}
