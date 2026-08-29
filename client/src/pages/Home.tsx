/* AchriDZ design: warm editorial marketplace, asymmetrical layouts, cream paper, olive trust, apricot action color. */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { trpc } from "@/lib/trpc";

const heroImage = "/manus-storage/achridz-hero_9830b0b5.jpg";
const homeImage = "/manus-storage/achridz-category-home_634056f7.jpg";
const techImage = "/manus-storage/achridz-category-tech_4849a06b.jpg";
const markImage = "/manus-storage/achridz-mark_bb26027b.png";

const categories = [
  { name: "الكل", icon: "✦", count: "12.4K" },
  { name: "أثاث وديكور", icon: "⌂", count: "3.8K" },
  { name: "إلكترونيات", icon: "◉", count: "2.6K" },
  { name: "سيارات", icon: "▱", count: "1.9K" },
  { name: "أزياء", icon: "◇", count: "1.2K" },
  { name: "هوايات", icon: "♧", count: "980" },
];

export const listings = [
  { id: 1, title: "كرسي خشبي بطابع قديم", price: "18,500 دج", city: "الجزائر العاصمة", category: "أثاث وديكور", condition: "بحالة ممتازة", image: homeImage, gallery: [homeImage, "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=85", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85"], time: "منذ 35 دقيقة", tone: "sage", seller: "ياسين من باب الواد", whatsapp: "213555123456" },
  { id: 2, title: "كاميرا Fujifilm مستعملة", price: "42,000 دج", city: "وهران", category: "إلكترونيات", condition: "قليل الاستعمال", image: techImage, time: "منذ ساعة", tone: "apricot" },
  { id: 3, title: "دراجة للمدينة — مقاس متوسط", price: "24,000 دج", city: "البليدة", category: "هوايات", condition: "جيدة جدًا", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=85", time: "منذ ساعتين", tone: "mustard" },
  { id: 4, title: "سماعات لاسلكية أصلية", price: "9,800 دج", city: "قسنطينة", category: "إلكترونيات", condition: "شبه جديدة", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", time: "منذ 3 ساعات", tone: "olive" },
  { id: 5, title: "سجادة يدوية صغيرة", price: "12,000 دج", city: "سطيف", category: "أثاث وديكور", condition: "بحالة جيدة", image: "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=85", time: "منذ 4 ساعات", tone: "apricot" },
  { id: 6, title: "راديو كلاسيكي للديكور", price: "6,000 دج", city: "تيزي وزو", category: "إلكترونيات", condition: "يعمل جيدًا", image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=85", time: "منذ 5 ساعات", tone: "sage" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const { favorites, toggleFavorite } = useFavorites();
  const approvedListings = trpc.listings.approved.useQuery();
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [city, setCity] = useState("كل المدن");
  const displayListings = approvedListings.data?.length ? approvedListings.data.map((item) => ({ id: item.id, title: item.title, price: `${item.price.toLocaleString("ar-DZ")} دج`, city: item.city, category: item.category, condition: item.condition, image: item.imageUrl || homeImage, time: "منشور حديثًا", tone: "sage" })) : listings;

  const filteredListings = useMemo(() => displayListings.filter((item) => {
    const matchesCategory = activeCategory === "الكل" || item.category === activeCategory;
    const matchesQuery = `${item.title} ${item.city}`.toLowerCase().includes(query.toLowerCase());
    const matchesCity = city === "كل المدن" || item.city === city;
    return matchesCategory && matchesQuery && matchesCity;
  }), [activeCategory, city, query, displayListings]);

  const handlePublish = () => { window.location.href = "/sell"; };

  return (
    <div className="site-shell" dir="rtl">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="AchriDZ - الصفحة الرئيسية">
            <img src={markImage} alt="" className="brand-mark" />
            <span><strong>Achri</strong><em>DZ</em></span>
          </button>
          <nav className={`main-nav ${showMenu ? "is-open" : ""}`}>
            <a href="#listings">تصفح الإعلانات</a>
            <a href="/favorites" className="favorites-nav"><Heart size={15} /> المفضلة {favorites.length > 0 && <b>{favorites.length}</b>}</a>
            <a href="#categories">الفئات</a>
            <a href="#how-it-works">كيف يعمل؟</a>
          </nav>
          <div className="top-actions">
            <button className="icon-button" aria-label="التنبيهات" onClick={() => toast("لا توجد تنبيهات جديدة") }><Bell size={18} /></button>
            <Button className="publish-button" onClick={handlePublish}><Plus size={17} /> انشر إعلانك</Button>
            <button className="mobile-menu" onClick={() => setShowMenu((v) => !v)} aria-label="فتح القائمة"><Menu size={21} /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> سوق الناس للناس</div>
            <h1>الحاجة اللي<br /><span>تستاهل فرصة ثانية.</span></h1>
            <p>لقّي، بيع، وعاود اكتشف أشياء مليحة قريبة ليك. بلا تعقيد، وبثقة أكبر.</p>
            <div className="hero-search">
              <Search size={20} />
              <input aria-label="ابحث عن إعلان" placeholder="واش راك تقلب؟" value={query} onChange={(event) => setQuery(event.target.value)} />
              <button onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>ابحث</button>
            </div>
            <div className="hero-meta"><span><Check size={15} /> {approvedListings.data?.length ?? 0} إعلانات منشورة</span><span><MapPin size={15} /> 69 ولاية</span></div>
          </div>
          <div className="hero-visual">
            <img src={heroImage} alt="أغراض مستعملة مرتبة على طاولة في سوق دافئ" />
            <div className="hero-sticker"><span>جديد هنا</span><strong>اكتشف<br />المزيد</strong><ArrowUpRight size={21} /></div>
            <div className="hero-caption"><span>01</span><span>أشياء عندها قصة</span><span className="caption-line" /></div>
          </div>
        </section>

        <section id="categories" className="category-section">
          <div className="section-heading"><div><span className="section-kicker">اختار طريقك <span className="paper-mark">قصاصة 02</span></span><h2>منين نبدأو؟</h2></div><button className="text-link" onClick={() => { setActiveCategory("الكل"); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }}>شوف كل الفئات <ArrowLeft size={17} /></button></div>
          <div className="category-strip">
            {categories.map((category, index) => <button key={category.name} className={`category-tile ${activeCategory === category.name ? "active" : ""} tile-${index}`} onClick={() => { setActiveCategory(category.name); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }}><span className="category-icon">{category.icon}</span><strong>{category.name}</strong><small>{category.count} إعلان</small></button>)}
          </div>
        </section>

        <section id="listings" className="listings-section">
          <div className="listing-header"><div><span className="section-kicker">قريب ليك <span className="paper-mark">وصل جديد</span></span><h2>آخر الإعلانات <small className="live-stamp">اليوم</small></h2></div><div className="listing-controls"><select value={city} onChange={(event) => setCity(event.target.value)} aria-label="تصفية حسب المدينة"><option>كل المدن</option><option>الجزائر العاصمة</option><option>وهران</option><option>البليدة</option><option>قسنطينة</option><option>سطيف</option><option>تيزي وزو</option></select><button className={`filter-button ${showFilters ? "active" : ""}`} onClick={() => setShowFilters((v) => !v)}><SlidersHorizontal size={17} /> فلاتر</button></div></div>
          {showFilters && <div className="filter-panel"><span>رتب حسب:</span><button onClick={() => toast("تم الترتيب حسب الأحدث")}>الأحدث <Check size={15} /></button><button onClick={() => toast("تم الترتيب حسب السعر")}>السعر الأقل</button><button onClick={() => setShowFilters(false)} aria-label="إغلاق الفلاتر"><X size={17} /></button></div>}
          <div className="results-note">{filteredListings.length} إعلانات مطابقة <span>•</span> تتحدث كل دقيقة</div>
          {filteredListings.length ? <div className="listing-grid">{filteredListings.map((item) => <article className="listing-card" key={item.id}><div className={`listing-image tone-${item.tone}`}><img src={item.image} alt={item.title} /><span className="condition-tag">{item.condition}</span><button className={`heart-button ${favorites.includes(item.id) ? "saved" : ""}`} onClick={() => { const added = toggleFavorite(item.id); toast.success(added ? "تم حفظ الإعلان في المفضلة" : "تمت إزالة الإعلان من المفضلة"); }} aria-label="إضافة إلى المفضلة"><Heart size={18} fill={favorites.includes(item.id) ? "currentColor" : "none"} /></button></div><div className="listing-info"><div className="listing-top"><span>{item.category}</span><small>{item.time}</small></div><h3>{item.title}</h3><strong className="price">{item.price}</strong><div className="listing-bottom"><span><MapPin size={14} /> {item.city}</span><a href={`/listing/${item.id}`} className="details-link">التفاصيل <ArrowLeft size={14} /></a></div></div></article>)}</div> : <div className="empty-state"><Tag size={26} /><h3>ما لقيناش نتائج بهذه الكلمات</h3><p>جرب كلمة أخرى أو رجّع الفلاتر للكل.</p><button onClick={() => { setQuery(""); setCity("كل المدن"); setActiveCategory("الكل"); }}>مسح البحث</button></div>}
        </section>

        <section id="how-it-works" className="trust-section"><div className="trust-intro"><span className="section-kicker">ببساطة</span><h2>من يدك<br /><em>لـ يد غيرك.</em></h2><p>AchriDZ يخلي البيع والشراء أقرب، أوضح، وأخف على القلب.</p></div><div className="trust-steps"><div><span>01</span><strong>صوّر حاجتك</strong><p>صور واضحة، تفاصيل صريحة، وسعر يناسبك.</p></div><div><span>02</span><strong>خلي الناس تلقاها</strong><p>إعلانك يوصل للناس اللي قريبين منك.</p></div><div><span>03</span><strong>اتلاقاو بثقة</strong><p>تواصل مباشر واتفاق على راحتكم.</p></div></div><div className="trust-mark"><img src={markImage} alt="" /><span>made for<br />second chances</span></div></section>
      </main>

      <footer className="footer"><div className="footer-brand"><img src={markImage} alt="" /><span>Achri<strong>DZ</strong></span></div><p>كل غرض عندو قصة. خلي قصتك تكمل.</p><div className="footer-links"><a href="#categories">الفئات</a><a href="#how-it-works">عن AchriDZ</a><a href="#">المساعدة</a></div></footer>
    </div>
  );
}
