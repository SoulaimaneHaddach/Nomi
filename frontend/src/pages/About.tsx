import SitePageLayout from "../components/SitePageLayout";

export default function About() {
  return (
    <SitePageLayout title="About Nomi">
      <div className="space-y-6">
        <p>Nomi is a web platform for cafés and restaurants to create, manage, and publish digital menus. Guests can open a menu from a link or QR code on a phone, tablet, or screen at the table.</p>

        <section>
          <h2 className="font-display text-xl font-semibold text-[#2B2320]">For restaurant owners</h2>
          <p className="mt-2">Each owner gets a private business workspace to organize categories and products, update prices and descriptions, upload images, control product visibility, and manage translations from a dashboard.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-[#2B2320]">For guests</h2>
          <p className="mt-2">Public menus work in a web browser on phones, tablets, monitors, and computers. Guests can browse available menu translations, including right-to-left languages such as Arabic.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-[#2B2320]">Platform management</h2>
          <p className="mt-2">Platform administrators can review business workspaces, see menu activity, and activate or suspend accounts. Owner and administrator access are handled separately.</p>
        </section>

        <p className="border-t border-[#2B2320]/10 pt-5 text-sm">Nomi currently focuses on managing and browsing digital menus. Online ordering, payments, kitchen integration, and dedicated kiosk mode are not available yet.</p>
      </div>
    </SitePageLayout>
  );
}
