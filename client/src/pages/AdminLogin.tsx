import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

export function getAdminDestination(user: { role: "admin" | "user" } | null | undefined) { return user?.role === "admin" ? "/admin" : user ? "/" : "/admin/login"; }

export default function AdminLogin() {
  const { user, loading, error, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) { const destination = getAdminDestination(user); if (destination !== "/admin/login") setLocation(destination); }

  }, [loading, setLocation, user]);

  return <div className="admin-login-shell" dir="rtl"><header className="detail-topbar"><Link href="/" className="detail-brand"><img src="/manus-storage/achridz-mark_bb26027b.png" alt="" /><span>Achri<em>DZ</em></span></Link><Link href="/" className="back-link"><ArrowRight size={17} /> العودة للسوق</Link></header><main className="admin-login-card"><div className="admin-login-icon"><LockKeyhole size={26} /></div><span className="section-kicker">بوابة الإدارة <span className="paper-mark">دخول آمن</span></span><h1>مساحة القرار<br /><em>للمشرفين فقط.</em></h1><p>استخدم حساب Manus المصرح به للوصول إلى مراجعة الإعلانات والتحقق من المدفوعات.</p><div className="admin-login-email">المدير الوحيد: <b>laminedz.19@gmail.com</b></div>{loading ? <div className="admin-login-status">جارٍ التحقق من الجلسة...</div> : error ? <div className="admin-login-error">تعذر التحقق من الجلسة. حاول تسجيل الدخول مجددًا.</div> : user ? <div className="admin-login-status">هذا الحساب لا يملك صلاحية الإدارة.<button className="admin-logout-button" onClick={() => logout()}>تسجيل الخروج</button></div> : <button className="admin-login-button" onClick={() => startLogin()}><ShieldCheck size={18} /> تسجيل الدخول بحساب الإدارة</button>}<small>لا نخزن كلمة مرور أو توكنًا داخل الموقع. تتم المصادقة عبر Manus OAuth ثم تُتحقق صلاحية `admin` من الخادم.</small></main></div>;
}
