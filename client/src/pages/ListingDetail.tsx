/* AchriDZ detail design: editorial product story, tactile labels, clear trust metadata, and direct human contact. */
import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight, Heart, MapPin, MessageCircle, ShieldCheck, Share2, Tag } from "lucide-react";
import { toast } from "sonner";
import { listings } from "./Home";
import { useFavorites } from "@/hooks/useFavorites";
import { trpc } from "@/lib/trpc";

export default function ListingDetail() {
  const [, params] = useRoute("/listing/:id");
  const [, navigate] = useLocation();
  const liveDetail = trpc.listings.detail.useQuery({ id: Number(params?.id) }, { enabled: Boolean(params?.id) });
  const staticItem = listings.find((listing) => String(listing.id) === params?.id);
  const item = liveDetail.data ? { id: liveDetail.data.id, title: liveDetail.data.title, price: `${liveDetail.data.price.toLocaleString("ar-DZ")} دج`, city: liveDetail.data.city, category: liveDetail.data.category, condition: liveDetail.data.condition, image: liveDetail.data.imageUrl || "/manus-storage/achridz-category-home_634056f7.jpg", gallery: liveDetail.data.imageUrl ? [liveDetail.data.imageUrl] : [], time: "منشور حديثًا", seller: "بائع AchriDZ", whatsapp: "213555123456" } : staticItem;
  const safeItem = item ?? listings[0];
  const gallery = safeItem.gallery?.length ? safeItem.gallery : [safeItem.image, safeItem.image, safeItem.image];
  const [activeImage, setActiveImage] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(safeItem.id);
  const seller = safeItem.seller ?? "بائع من مجتمع AchriDZ";
  const whatsapp = safeItem.whatsapp ?? "213555123456";
  const whatsappText = encodeURIComponent(`سلام، شفت إعلانك على AchriDZ بخصوص «${safeItem.title}». مازال متوفر؟`);
  if (!item && !liveDetail.isLoading) return <div className="detail-shell not-found-detail" dir="rtl"><header className="detail-topbar"><Link href="/" className="detail-brand"><img src="/manus-storage/achridz-mark_bb26027b.png" alt="" /><span>Achri<em>DZ</em></span></Link></header><main className="detail-not-found"><Tag size={32} /><h1>الإعلان غير موجود</h1><p>ربما تم حذفه أو لم تتم الموافقة عليه بعد.</p><Link href="/">العودة إلى السوق</Link></main></div>;

  const moveImage = (direction: number) => setActiveImage((current) => (current + direction + gallery.length) % gallery.length);

  return <div className="detail-shell" dir="rtl">
    <header className="detail-topbar"><Link href="/" className="detail-brand"><img src="/manus-storage/achridz-mark_bb26027b.png" alt="" /><span>Achri<em>DZ</em></span></Link><Link href="/" className="back-link"><ArrowRight size={17} /> رجوع للإعلانات</Link></header>
    <main className="detail-main">
      <div className="detail-breadcrumb"><Link href="/">الرئيسية</Link><ChevronLeft size={14} /><span>{safeItem.category}</span><ChevronLeft size={14} /><strong>{safeItem.title}</strong></div>
      <section className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-main-image"><img src={gallery[activeImage]} alt={`${safeItem.title} - صورة ${activeImage + 1}`} /><span className="gallery-count">{String(activeImage + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span><button className="gallery-arrow next" onClick={() => moveImage(1)} aria-label="الصورة التالية"><ChevronLeft size={21} /></button><button className="gallery-arrow prev" onClick={() => moveImage(-1)} aria-label="الصورة السابقة"><ChevronRight size={21} /></button></div>
          <div className="thumbnail-row">{gallery.map((image, index) => <button key={`${image}-${index}`} className={`thumbnail ${activeImage === index ? "active" : ""}`} onClick={() => setActiveImage(index)} aria-label={`عرض الصورة ${index + 1}`}><img src={image} alt="" /></button>)}</div>
        </div>
        <article className="detail-copy"><div className="detail-label"><span className="paper-mark">إعلان مميز</span><span>{safeItem.time}</span></div><h1>{safeItem.title}</h1><div className="detail-price">{safeItem.price}</div><div className="detail-location"><MapPin size={17} /> {safeItem.city} <span>•</span> {safeItem.condition}</div><div className="detail-divider" /><p className="detail-description">غرض مختار بعناية وحالته واضحة في الصور. البائع يرحب بالأسئلة والتفاصيل الإضافية قبل الاتفاق، والتسليم يتم في مكان عام يناسب الطرفين.</p><div className="detail-actions"><a className="whatsapp-button" href={`https://wa.me/${whatsapp}?text=${whatsappText}`} target="_blank" rel="noreferrer"><MessageCircle size={20} /> تواصل مع البائع عبر واتساب</a><button className={`save-detail ${saved ? "saved" : ""}`} onClick={() => { const added = toggleFavorite(safeItem.id); toast.success(added ? "تم حفظ الإعلان في المفضلة" : "تمت إزالة الإعلان من المفضلة"); }}><Heart size={19} fill={saved ? "currentColor" : "none"} /> {saved ? "محفوظ" : "حفظ الإعلان"}</button><button className="share-detail" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast("تم نسخ رابط الإعلان"); }}><Share2 size={18} /> مشاركة</button></div><div className="seller-card"><div className="seller-avatar">{seller.charAt(0)}</div><div><span>البائع</span><strong>{seller}</strong><small><ShieldCheck size={13} /> يتواصل عبر AchriDZ</small></div><Tag size={21} className="seller-tag" /></div></article>
      </section>
      <section className="detail-notes"><div><ShieldCheck size={21} /><div><strong>تواصل بأمان</strong><p>خلي اللقاء في مكان عام، وتأكد من السلعة قبل الدفع.</p></div></div><div><MapPin size={21} /><div><strong>قريب منك</strong><p>الإعلان موجود في {safeItem.city} ويمكن الاتفاق على موعد مناسب.</p></div></div><div><MessageCircle size={21} /><div><strong>اسأل مباشرة</strong><p>استعمل واتساب لمعرفة أي تفاصيل إضافية من البائع.</p></div></div></section>
      <button className="mobile-back" onClick={() => navigate("/")}><ArrowRight size={17} /> العودة إلى الإعلانات</button>
    </main>
  </div>;
}
