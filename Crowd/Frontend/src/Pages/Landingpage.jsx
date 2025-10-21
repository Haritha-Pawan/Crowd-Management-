import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Service from "./Service";
import Banner from "./Banner";
import { User, LogOut, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DaladaLanding() {
  const year = new Date().getFullYear();

  // ---- language state (default English) ----
  const [lang, setLang] = useState("en");
  const copy = useMemo(
    () => ({
      en: {
        brand: "CrowdFlow",
        brandSub: "Test",
        nav: {
          about: "About",
          visit: "Plan Your Visit",
          contact: "Contact",
          signIn: "Sign In",
          Parking: "Parking Spot",
        },
        heroTitle: "Smart Crowd Management",
        heroTag:
          "Learn the significance of the Sacred Tooth Relic, explore traditions, and plan your visit to Kandy with respect and ease.",
        heroCTAL: "Get Started",
        heroCTAR: "Get in Touch",
        visitTitle: "Plan Your Visit",
        visitCards: [
          ["Timings", "Daily worship times vary; mornings are quieter."],
          ["Attire", "Shoulders and knees covered; light fabrics recommended."],
          ["Donations", "Offerings are voluntary; use official counters."],
        ],
        contactTitle: "Contact Us",
        contactName: "Full Name",
        contactEmail: "Email",
        contactMsg: "Message",
        contactSend: "Send Message",
        addressHead: "Address",
        addressText: "Sri Dalada Maligawa, Kandy, Sri Lanka",
        footerBrand: "Sri Dalada Vandanā",
        footerTag: "A respectful guide for visitors",
        footerLangs: "සිංහල / தமிழ் / English",
        location: "Kandy • Sri Lanka",
      },
      si: {
        brand: "CrowdFlow",
        brandSub: "පරීක්ෂණ",
        nav: { about: "පිළිබඳව", visit: "ඔබේ සංචාරය", contact: "සම්බන්ධ වන්න", signIn: "පිවිසෙන්න",Parking:"වාහන නැවැත්වීම" },
        heroTitle: "බුද්ධිමත් නැගුරුවූ පිරිස් කළමනාකරණය",
        heroTag:
          "දළදා මාළිගාවේ වැදගත්කම ගැන ඉගෙන ගනිමින්, සිද්ධස්ථාන රිති රූ සැදැහැයෙන් අනුගමනය කරමින්, ඔබගේ සංචාරය සැලසුම් කරයි.",
        heroCTAL: "තවත් දැනගන්න",
        heroCTAR: "අප හා සම්බන්ධ වන්න",
        visitTitle: "ඔබේ සංචාරය සැලසුම් කරන්න",
        visitCards: [
          ["වේලාවන්", "දෛනික පූජා වේලාවන් වෙනස් විය හැක; උදෑසන සන්සුන්ය."],
          ["පළඳුන", "තොල හා දණ පසාරු නොවී; හිස්පාද වන්න."],
          ["පරිත්‍යාග", "මනාපය පරිදි; නිල කවුන්ටර් භාවිතා කරන්න."],
        ],
        contactTitle: "අප අමතන්න",
        contactName: "පිළිපන් නාමය",
        contactEmail: "ඊමේල්",
        contactMsg: "පණිවුඩය",
        contactSend: "යවන්න",
        addressHead: "ලිපිනය",
        addressText: "ශ්‍රී දළදා මාළිගාව, මහනුවර, ශ්‍රී ලංකා",
        footerBrand: "ශ්‍රී දළදා වන්දනා",
        footerTag: "සංචාරිකයින්ට ගෞරවයෙන්",
        footerLangs: "සිංහල / தமிழ் / English",
        location: "මහනුවර • ශ්‍රී ලංකා",
      },
      ta: {
        brand: "CrowdFlow",
        brandSub: "சோதனை",
        nav: {
          about: "எங்களை பற்றி",
          visit: "உங்கள் பயணம்",
          contact: "தொடர்பு",
          signIn: "உள் நுழை",
        },
        heroTitle: "ஸ்மார்ட் கூட்ட மேலாண்மை",
        heroTag:
          "புனித பல் திருவாளயம் குறித்து அறிந்து, மரபுகளை மதித்து, கண்டி பயணத்தை எளிதாகத் திட்டமிடுங்கள்.",
        heroCTAL: "மேலும் அறிய",
        heroCTAR: "எங்களைத் தொடர்புகொள்ள",
        visitTitle: "உங்கள் பயணத்தைத் திட்டமிடுங்கள்",
        visitCards: [
          [
            "நேரங்கள்",
            "தினசரி வழிபாட்டு நேரங்கள் மாறலாம்; காலை நேரம் அமைதியாக இருக்கும்.",
          ],
          ["உடை", "தோள்கள்/முழங்கால் மூடப்பட்ட உடை; இலகு துணி பரிந்துரை."],
          ["இரக்கம்", "தன்னார்வம்; அதிகாரப்பூர்வ கவுண்டர்களை பயன்படுத்தவும்."],
        ],
        contactTitle: "எங்களைத் தொடர்புகொள்ள",
        contactName: "முழுப் பெயர்",
        contactEmail: "மின்னஞ்சல்",
        contactMsg: "செய்தி",
        contactSend: "அனுப்பு",
        addressHead: "முகவரி",
        addressText: "ஸ்ரீ தலாதா மாளிகை, கண்டி, இலங்கை",
        footerBrand: "ஸ்ரீ தலாதா வந்தனா",
        footerTag: "பார்வையாளர்களுக்கான மரியாதையான வழிகாட்டி",
        footerLangs: "සිංහල / தமிழ் / English",
        location: "கண்டி • இலங்கை",
      },
    }),
    []
  );

  const t = (k) => copy[lang][k];

  const colors = {
    navInk: "text-white ",
    cta: "#2563eb",
  };

  // motion
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };
  const stagger = { show: { transition: { staggerChildren: 0.12 } } };

  const Section = ({ id, title, children }) => (
    <section id={id} className="max-w-7xl mx-auto px-6 py-16">
      {title && (
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="text-2xl md:text-3xl font-semibold mb-6 text-indigo-700"
        >
          {title}
        </motion.h2>
      )}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {children}
      </motion.div>
    </section>
  );
 // ✅ Check login status here (before return)
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO ===== */}
      <section className="relative h-[100svh] w-full">
        <img
          src="https://sridaladamaligawa.lk/wp-content/uploads/2020/09/Octagan-Thumbnail-2-768x432.jpg"
          alt="Sri Dalada Maligawa"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* Top nav with language switcher */}
   <header className="absolute top-0 left-0 right-0 z-20 backdrop-blur-3xl">
  <nav className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
    
    {/* --- Left: Brand --- */}
    <div className="flex items-center gap-3">
      <svg width="28" height="28" viewBox="0 0 24 24" className={colors.navInk}>
        <path fill="currentColor" d="M12 2l2 3H10l2-3Zm0 4c3.866 0 7 3.134 7 7h-2a5 5 0 1 0-10 0H5c0-3.866 3.134-7 7-7Zm-8 9h16l2 5H2l2-5Z"/>
      </svg>
      <div className="leading-tight">
        <span className="block font-bold tracking-wide text-3xl text-white">{copy[lang].brand}</span>
        <span className="block text-xs text-white/80">{copy[lang].brandSub}</span>
      </div>
    </div>

    {/* --- Center: Navigation Links --- */}
    <div className="hidden md:flex items-center gap-1 text-sm font-bold">
      <a href="#about" className="px-3 py-2 rounded-md text-white hover:bg-white/10">{copy[lang].nav.about}</a>
      <a href="#visit" className="px-3 py-2 rounded-md text-white hover:bg-white/10">{copy[lang].nav.visit}</a>
      <a href="#contact" className="px-3 py-2 rounded-md text-white hover:bg-white/10">{copy[lang].nav.contact}</a>
      <Link to="/parking" className="relative px-3 py-2 rounded-md text-white hover:bg-white/10">
        {copy[lang].nav.Parking}
        <span className="absolute top-1 h-3 w-3 rounded-full bg-green-400 animate-ping opacity-80 [animation-duration:1.2s]" />
      </Link>
    </div>

    {/* --- Right: Sign In + Profile --- */}
    <div className="flex items-center gap-4">
      <Link
        to="/login"
        className="px-4 py-2 rounded-lg text-white shadow-sm hover:brightness-105"
        style={{ backgroundColor: colors.cta }}
      >
        {copy[lang].nav.signIn}
      </Link>

      

      {/* Language Selector */}
      <div className="ml-3 flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/20">
        {[
          { id: "si", label: "සිං", title: "සිංහල" },
          { id: "ta", label: "தமிழ்", title: "தமிழ்" },
          { id: "en", label: "EN", title: "English" },
        ].map((l) => (
          <button
            key={l.id}
            title={l.title}
            onClick={() => setLang(l.id)}
            className={`px-2.5 py-1 text-xs rounded-full ${
              lang === l.id ? "bg-white text-black" : "text-white/90 hover:bg-white/10"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  </nav>
</header>


        {/* Centered hero content */}
        <motion.div
  variants={fadeUp}
  initial="hidden"
  animate="show"
  className="absolute inset-0 z-10 flex items-center justify-center px-6"
>
  <div className="max-w-3xl text-center text-white px-6 py-8 md:px-10 md:py-12 shadow-xl">
    <h1
      className={`font-extrabold tracking-tight leading-tight  relative right-10
                  text-[clamp(28px,8vw,64px)] ${lang === "en" ? "whitespace-nowrap" : ""}` }
    >
      {copy[lang].heroTitle}
    </h1>

    <p className="mt-4 md:mt-5 text-white/85 md:text-lg leading-relaxed relative  font-bold">
      {copy[lang].heroTag}
    </p>
    <div className="mt-6 flex items-center justify-center gap-3">
      <Link to="/login" className="px-6 py-3 rounded-lg bg-indigo-600 font-bold border border-indigo-500 text-white hover:brightness-110 shadow-sm">
        {copy[lang].heroCTAL}
      </Link>
      <a href="#contact" className="px-6 py-3 rounded-lg bg-white/10 border font-bold border-white/25 text-white hover:bg-white/15">
        {copy[lang].heroCTAR}
      </a>
    </div>
  </div>
</motion.div>

            <p className="mt-4 md:mt-5 text-white/85 md:text-lg leading-relaxed relative  font-bold">
              {copy[lang].heroTag}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href="#about"
                className="px-6 py-3 rounded-lg bg-indigo-600 font-bold border border-indigo-500 text-white hover:brightness-110 shadow-sm"
              >
                {copy[lang].heroCTAL}
              </a>
              <a
                href="#contact"
                className="px-6 py-3 rounded-lg bg-white/10 border font-bold border-white/25 text-white hover:bg-white/15"
              >
                {copy[lang].heroCTAR}
              </a>
            </div>
          </div>
        </motion.div>

        {/* Location hint */}
        <div className="absolute bottom-4 left-6 text-xs text-white/80">
          {copy[lang].location}
        </div>
      </section>

      {/* Your extra sections */}
      <Service />
      <Banner />

      {/* Visit */}
      <Section id="visit" title={copy[lang].visitTitle}>
        <div className="grid md:grid-cols-3 gap-6">
          {copy[lang].visitCards.map(([title, text], i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-indigo-700">{title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact" title={copy[lang].contactTitle}>
        <div className="grid md:grid-cols-2 gap-6">
          <motion.form
            variants={fadeUp}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700">
                  {copy[lang].contactName}
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700">
                  {copy[lang].contactEmail}
                </label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-slate-700">
                {copy[lang].contactMsg}
              </label>
              <textarea
                rows={5}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-5 py-2.5 rounded-lg text-white bg-indigo-600 border border-indigo-700 shadow-sm hover:brightness-105"
            >
              {copy[lang].contactSend}
            </button>
          </motion.form>

          <motion.div
            variants={fadeUp}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="font-semibold text-indigo-700">
              {copy[lang].addressHead}
            </h3>
            <p className="mt-2 text-slate-700 text-sm leading-relaxed">
              {copy[lang].addressText}
            </p>
            <div className="mt-4">
              <motion.img
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
                className="w-full h-64 object-cover rounded-xl border border-slate-200"
                src="https://www.google.com/maps/vt/data=E_pQrC0wPPSc9KQ_hho9-fQjEOrz1jeh7C-lpK9-6XrT9ALk_8rdtJcezxy_xFjawb5KOTNRZP2JAUzriMoUkpCfJeEpplZylpiy-mbJXNEhse4BoZBELGk5-rcQCS8Qh3oESHFua1gZ9P_5YT0FUi9KdGTkQ4Vrdqvd04aYRm9aAG9B4p2qkdQ1TwDSJPPQTPo_u3RZfWVjdWV2Uyys1lhchDuKyVv4vBL0u03YhPyoHRI9zaAClXTDgaMp8txwXg6wKAc2xQ6kkQqg2AEsAcqc4r0zXZnegfmDiqKFMDA"
                alt="Kandy city view"
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Map preview (replace with an interactive map if needed).
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600">
        <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ color: "#1e3a8a" }}
            >
              <path
                fill="currentColor"
                d="M12 2l2 3H10l2-3Zm0 4c3.866 0 7 3.134 7 7h-2a5 5 0 1 0-10 0H5c0-3.866 3.134 7 7-7Zm-8 9h16l2 5H2l2-5Z"
              />
            </svg>
            <div>
              <div className="font-semibold text-indigo-700">
                {copy[lang].footerBrand}
              </div>
              <div className="text-xs text-slate-500">
                {copy[lang].footerTag}
              </div>
            </div>
          </div>
          <div className="text-sm">
            © {year} • Crafted in Sri Lanka • {copy[lang].footerLangs}
          </div>
          <div className="flex gap-4 text-sm justify-start md:justify-end">
            <a href="#about" className="hover:underline">
              {copy[lang].nav.about}
            </a>
            <a href="#visit" className="hover:underline">
              {copy[lang].nav.visit}
            </a>
            <a href="#contact" className="hover:underline">
              {copy[lang].nav.contact}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
