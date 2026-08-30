import { useLang } from "../i18n/LanguageContext";
import StaticPage from "./StaticPage";

export default function Terms({ onBack }) {
  const { t, lang } = useLang();
  const isHa = lang === "ha";

  return (
    <StaticPage title={t.termsTitle} updated={t.lastUpdated} onBack={onBack}>
      {isHa ? (
        <>
          <p>
            Ta hanyar amfani da Fara'id AI, kun amince da waɗannan sharuɗɗa.
            Da fatan a karanta su a hankali.
          </p>
          <h3 className="font-semibold text-gray-900">1. Manufar Sabis</h3>
          <p>
            Fara'id AI kayan aiki ne na ilimi/lissafi da ke taimaka wa masu
            amfani su kiyasta rabon gado bisa hukuncin Fara'id na Musulunci.
            Sakamakon da aka bayar ba shawarar shari'a ba ce ta hukuma, kuma
            ba ta maye gurbin fatawar wani malamin da ya cancanta ba.
          </p>
          <h3 className="font-semibold text-gray-900">2. Nauyin Amfani</h3>
          <p>
            Kai ne ke da alhakin tabbatar da daidaiton bayanan da ka shigar
            (kamar dukiya, magada, da bashi), da kuma tuntuɓar malami ko
            lauya kafin ka aiwatar da wani rabon dukiya na hakika bisa
            sakamakon da aka nuna.
          </p>
          <h3 className="font-semibold text-gray-900">3. Babu Garanti</h3>
          <p>
            Muna ba da wannan sabis "kamar yadda yake" ba tare da wani
            garanti ba, ko na bayyane ko na ɓoye, game da daidaito, cikakke,
            ko dacewa da wani yanayi na musamman.
          </p>
          <h3 className="font-semibold text-gray-900">4. Iyakar Alhaki</h3>
          <p>
            Fara'id AI da masu haɓaka shi ba za su ɗauki alhakin wata asara
            ko lahani da ta samo asali daga amfani da wannan sabis ba.
          </p>
          <h3 className="font-semibold text-gray-900">5. Canje-canje</h3>
          <p>
            Muna iya sabunta waɗannan sharuɗɗa lokaci-lokaci. Ci gaba da
            amfani da sabis ɗin bayan an sabunta su yana nufin kun amince da
            sabbin sharuɗɗan.
          </p>
        </>
      ) : (
        <>
          <p>
            By using Fara'id AI, you agree to these terms. Please read them
            carefully.
          </p>
          <h3 className="font-semibold text-gray-900">1. Purpose of the Service</h3>
          <p>
            Fara'id AI is an educational and computational tool that helps
            users estimate the distribution of an estate under Islamic
            inheritance (Fara'id) law. Results provided are not an official
            legal or religious ruling and do not replace a fatwa from a
            qualified scholar.
          </p>
          <h3 className="font-semibold text-gray-900">2. Your Responsibility</h3>
          <p>
            You are responsible for the accuracy of the information you enter
            (such as estate value, heirs, and debts), and for consulting a
            qualified scholar or lawyer before acting on any real-world
            distribution based on the results shown.
          </p>
          <h3 className="font-semibold text-gray-900">3. No Warranty</h3>
          <p>
            The service is provided "as is" without warranties of any kind,
            express or implied, regarding accuracy, completeness, or fitness
            for a particular purpose.
          </p>
          <h3 className="font-semibold text-gray-900">4. Limitation of Liability</h3>
          <p>
            Fara'id AI and its developers are not liable for any loss or
            damage arising from the use of this service.
          </p>
          <h3 className="font-semibold text-gray-900">5. Changes</h3>
          <p>
            We may update these terms from time to time. Continued use of the
            service after changes are made means you accept the updated
            terms.
          </p>
        </>
      )}
    </StaticPage>
  );
}
