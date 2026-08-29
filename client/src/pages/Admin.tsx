import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Check, Clock3, ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [reasonFor, setReasonFor] = useState<number | null>(null);
  useEffect(() => {
    if (!loading && user && user.role !== "admin") {
      toast.error("هذه المساحة مخصصة للمشرفين فقط");
      setLocation("/admin/login");
    }
  }, [loading, setLocation, user]);
  const [reason, setReason] = useState("");
  const [proofPreview, setProofPreview] = useState<{ url: string; title: string } | null>(null);
  useEffect(() => { if (!proofPreview) return; const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setProofPreview(null); }; document.addEventListener("keydown", onKeyDown); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; }; }, [proofPreview]);
  const pending = trpc.listings.pending.useQuery(undefined, { enabled: user?.role === "admin" });
  const utils = trpc.useUtils();
  const verifyPayment = trpc.listings.verifyPayment.useMutation({ onSuccess: (_, input) => { toast.success(input.paymentStatus === "verified" ? "تم تأكيد الدفع" : "تم رفض إثبات الدفع"); utils.listings.pending.invalidate(); }, onError: (error) => toast.error(error.message || "تعذر تحديث الدفع") });
  const review = trpc.listings.review.useMutation({
    onSuccess: (_, input) => {
      toast.success(input.status === "approved" ? "تم قبول الإعلان" : "تم رفض الإعلان");
      setReasonFor(null); setReason("");
      utils.listings.pending.invalidate();
    },
    onError: (error) => toast.error(error.message || "تعذر تحديث الإعلان"),
  });

  return <DashboardLayout><div className="admin-page" dir="rtl"><div className="admin-heading"><div><span className="section-kicker">مساحة الإدارة <span className="paper-mark">مراجعة</span></span><h1>الإعلانات<br /><em>تحتاج قرارك.</em></h1><p>راجع الإعلانات قبل نشرها للعامة، وخلي السوق أوضح وأوثق.</p></div><div className="admin-stat"><Clock3 size={20} /><strong>{pending.data?.length ?? 0}</strong><span>معلقة الآن</span></div></div>{pending.isLoading ? <div className="admin-empty">جارٍ تحميل الإعلانات...</div> : pending.error ? <div className="admin-empty"><X size={28} /><h2>لا يمكن فتح مساحة الإدارة</h2><p>تأكد من تسجيل الدخول بحساب Admin.</p></div> : pending.data?.length ? <div className="admin-list">{pending.data.map((item) => <article className="admin-card" key={item.id}><div className="admin-card-media">{item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <div className="no-image">بدون صورة</div>}</div><div className="admin-card-content"><div className="admin-card-meta"><span>{item.category}</span><small>{item.city}</small></div><h2>{item.title}</h2><strong>{item.price.toLocaleString("ar-DZ")} دج</strong><p>{item.description}</p><div className="payment-review"><strong>حالة الدفع: {item.paymentStatus === "verified" ? "مؤكد" : item.paymentStatus === "rejected" ? "مرفوض" : "بانتظار التحقق"}</strong>{item.paymentReference && <span>مرجع التحويل: <b>{item.paymentReference}</b></span>}{item.paymentProofUrl && <button type="button" className="payment-proof-link" onClick={() => setProofPreview({ url: item.paymentProofUrl!, title: item.title })}>تكبير صورة وصل الدفع</button>}{item.paymentStatus !== "verified" && <Button size="sm" className="payment-verify-action" disabled={verifyPayment.isPending} onClick={() => verifyPayment.mutate({ id: item.id, paymentStatus: "verified" })}><Check size={14} /> تأكيد استلام 300 دج</Button>}</div><div className="admin-card-actions"><Button className="approve-action" disabled={review.isPending} onClick={() => review.mutate({ id: item.id, status: "approved" })}><Check size={16} /> قبول ونشر</Button><Button variant="outline" className="reject-action" disabled={review.isPending} onClick={() => setReasonFor(item.id)}><X size={16} /> رفض</Button><a href={`/listing/${item.id}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /> معاينة</a></div>{reasonFor === item.id && <div className="reject-box"><Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="اكتب سبب الرفض للمستخدم..." /><div><button onClick={() => setReasonFor(null)}>إلغاء</button><button disabled={!reason.trim() || review.isPending} onClick={() => review.mutate({ id: item.id, status: "rejected", rejectionReason: reason.trim() })}>تأكيد الرفض</button></div></div>}</div></article>)}</div> : <div className="admin-empty"><Check size={30} /><h2>كل شيء مراجع</h2><p>لا توجد إعلانات معلقة حاليًا.</p></div>}</div>{proofPreview && <div className="proof-modal-backdrop" role="presentation" onClick={() => setProofPreview(null)}><div className="proof-modal" role="dialog" aria-modal="true" aria-labelledby="proof-modal-title" onClick={(event) => event.stopPropagation()}><div className="proof-modal-header"><h2 id="proof-modal-title">وصل الدفع — {proofPreview.title}</h2><button type="button" aria-label="إغلاق المعاينة" onClick={() => setProofPreview(null)}><X size={20} /></button></div><img src={proofPreview.url} alt={`وصل دفع للإعلان ${proofPreview.title}`} /><p>اضغط خارج النافذة أو زر Escape للإغلاق.</p></div></div>}</DashboardLayout>;
}
