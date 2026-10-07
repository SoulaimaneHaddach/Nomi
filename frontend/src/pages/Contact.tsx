import SitePageLayout from "../components/SitePageLayout";

const contactEmail = "soulaiman3783@gmail.com";

export default function Contact() {
  return (
    <SitePageLayout title="Contact Nomi">
      <p>Have a question about Nomi or setting up a digital menu? Get in touch by email.</p>
      <a className="nomi-public-action is-secondary mt-6 inline-flex no-underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
    </SitePageLayout>
  );
}
