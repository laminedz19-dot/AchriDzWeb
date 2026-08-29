/* AchriDZ favorites design: a saved-items shelf with fast local search, clear filters, and tactile cards. */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Heart, MapPin, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { listings } from "./Home";
import { useFavorites } from "@/hooks/useFavorites";
import { trpc } from "@/lib/trpc";
import { ALGERIA_WILAYAS } from "@shared/wilayas";

export default function Favorites() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const liveApproved = trpc.listings.approved.useQuery();
  const liveMapped = (liveApproved.data ?? []).map((item) => ({ id: item.id, title: item.title, price: `${item.price.toLocaleString("ar-DZ")} دج`, city: item.city, category: item.category, condition: item.condition, image: item.imageUrl || "/manus-storage/achridz-category-home_634056f7.jpg", time: "منشور حديثًا", tone: "sage" }));
  const sourceListings = [...listings.filter((item) => !liveMapped.some((live) => live.id === item.id)), ...liveMapped];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const [city, setCity] = useState("كل المدن");
  const [sort, setSort] = useState("newest");
  const savedListings = sourceListings.filter((listing) => favorites.includes(listing.id));
  const categories = ["الكل", ...Array.from(new Set(savedListings.map((item) => item.category)))];
  const cities = ["كل المدن", ...ALGERIA_WILAYAS];
  const visibleListings = useMemo(() => savedListings.filter((item) => {
    const matchesQuery = `${item.title} ${item.category} ${item.city}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "الكل" || item.category === category) && (city === "كل المدن" || item.city === city);
  }).sort((a, b) => {
    if (sort === "price-low") return Number(a.price.replace(/[^0-9]/g, "")) - Number(b.price.replace(/[^0-9]/g, ""));
    if (sort === "price-high") return Number(b.price.replace(/[^0-9]/g, "")) - Number(a.price.replace(/[^0-9]/g, ""));
    return a.id - b.id;
  }), [savedListings, query, category, city, sort]);

  const resetFilters = () => { setQuery(""); setCategory("الكل"); setCity("كل المدن"); setSort("newest"); };

  return <div className="favorites-shell" dir="rtl">
    <header className="favorites-topbar"><Link href="/" className="detail-brand"><img src="/manus-storage/achridz-mark_bb26027b.png" alt="" /><span>Achri<em>DZ</em></span></Link><Link href="/" className="back-link"><ArrowRight size={17} /> العودة للسوق</Link></header>
    <main className="favorites-main"><div className="favorites-heading"><div><span className="section-kicker">رفّك الخاص <span className="paper-mark">محفوظ</span></span><h1>الإعلانات<br /><em>اللي عجبوك.</em></h1></div>{savedListings.length > 0 && <button className="clear-favorites" onClick={() => { clearFavorites(); toast.success("تم إفراغ المفضلة"); }}><Trash2 size={16} /> إفراغ القائمة</button>}</div>
      {savedListings.length > 0 ? <><p className="favorites-count">عندك {savedListings.length} {savedListings.length === 1 ? "إعلان محفوظ" : "إعلانات محفوظة"} باش ترجع لهم وقت ما تحب.</p><div className="favorites-toolbar"><div className="favorites-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="قلب في المحفوظات..." aria-label="البحث في المحفوظات" />{query && <button onClick={() => setQuery("")} aria-label="مسح البحث"><X size={15} /></button>}</div><div className="favorites-selects"><label><SlidersHorizontal size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="تصفية حسب الفئة">{categories.map((value) => <option key={value}>{value}</option>)}</select></label><label><MapPin size={15} /><select value={city} onChange={(event) => setCity(event.target.value)} aria-label="تصفية حسب المدينة">{cities.map((value) => <option key={value}>{value}</option>)}</select></label><label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="فرز المحفوظات"><option value="newest">الأحدث</option><option value="price-low">السعر: الأقل</option><option value="price-high">السعر: الأعلى</option></select></label></div></div>{(query || category !== "الكل" || city !== "كل المدن") && <div className="active-filter-note">{visibleListings.length} نتائج مطابقة <button onClick={resetFilters}>مسح الفلاتر</button></div>}{visibleListings.length > 0 ? <div className="favorites-grid">{visibleListings.map((item) => <article className="favorite-card" key={item.id}><div className={`favorite-image tone-${item.tone}`}><img src={item.image} alt={item.title} /><span className="condition-tag">{item.condition}</span><button className="remove-favorite" onClick={() => { removeFavorite(item.id); toast.success("تمت إزالة الإعلان من المفضلة"); }} aria-label={`إزالة ${item.title} من المفضلة`}><Heart size={18} fill="currentColor" /></button></div><div className="favorite-info"><span>{item.category}</span><h2>{item.title}</h2><strong>{item.price}</strong><div><small><MapPin size={13} /> {item.city}</small><Link href={`/listing/${item.id}`}>شوف الإعلان <ArrowRight size={14} /></Link></div></div></article>)}</div> : <div className="filtered-empty"><Search size={26} /><h2>ما لقيناش في المحفوظات</h2><p>جرب كلمة أخرى أو رجّع خيارات التصفية.</p><button onClick={resetFilters}>مسح الفلاتر</button></div>}</> : <div className="favorites-empty"><div className="empty-heart"><Heart size={34} /></div><span className="section-kicker">القائمة مازالت فارغة</span><h2>خلي الحاجات اللي عجبتك هنا.</h2><p>اضغط على القلب في أي إعلان، وتلقاه محفوظ هنا باش ترجع له بسهولة.</p><Link href="/#listings" className="browse-button">تصفح الإعلانات <ArrowRight size={16} /></Link></div>}
    </main>
  </div>;
}
