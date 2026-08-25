import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, MessageSquare, Shield, Clock, User, Activity, Server, Database, Wifi, GraduationCap, UserPlus, Link, Image, FileText, Filter, Search, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';
import AdminCrudPanel from './AdminCrudPanel';

type AdminTab = 'events' | 'audit' | 'students' | 'accounts' | 'linking' | 'gallery' | 'applications';

interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  user_id: string | null;
  username: string | null;
  ip_address: string | null;
  details: string | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  login_success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  login_failed: 'bg-red-50 text-red-700 border-red-200',
  password_verified: 'bg-blue-50 text-blue-700 border-blue-200',
  otp_sent: 'bg-amber-50 text-amber-700 border-amber-200',
  otp_verified: 'bg-green-50 text-green-700 border-green-200',
  student_created: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  student_updated: 'bg-blue-50 text-blue-700 border-blue-200',
  student_deleted: 'bg-red-50 text-red-700 border-red-200',
  staff_created: 'bg-purple-50 text-purple-700 border-purple-200',
  staff_updated: 'bg-purple-50 text-purple-700 border-purple-200',
  staff_deleted: 'bg-red-50 text-red-700 border-red-200',
  gallery_image_added: 'bg-teal-50 text-teal-700 border-teal-200',
  gallery_image_deleted: 'bg-orange-50 text-orange-700 border-orange-200',
  account_created: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  parent_student_linked: 'bg-pink-50 text-pink-700 border-pink-200',
  event_approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  event_rejected: 'bg-red-50 text-red-700 border-red-200',
  content_flagged: 'bg-orange-50 text-orange-700 border-orange-200',
  application_reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
};

const staffRoleOptions = [
  { value: 'principal', labelEn: 'Principal', labelMr: 'मुख्याध्यापक' },
  { value: 'class_teacher', labelEn: 'Class Teacher', labelMr: 'वर्गशिक्षक' },
  { value: 'clerk', labelEn: 'Clerk', labelMr: 'लिपिक' },
  { value: 'subject_teacher', labelEn: 'Subject Teacher', labelMr: 'विषय शिक्षक' },
  { value: 'web_creator', labelEn: 'Super Admin', labelMr: 'सुपर अॅडमिन' },
];

function CreateStaffAccountPanel({ language, t }: { language: string; t: (en: string, mr: string) => string }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState('class_teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) { setError(t('Full name is required.', 'पूर्ण नाव आवश्यक आहे.')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(t('A valid email is required.', 'वैध ईमेल आवश्यक आहे.')); return; }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email, mobileNumber: mobileNumber || undefined, role, nameEn: fullName.trim(), nameMr: fullName.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(t(`Account created! Username: ${data.user?.username}. Temporary password sent to email.`, `खाते तयार! वापरकर्तानाव: ${data.user?.username}. तात्पुरता पासवर्ड ईमेलवर पाठवला.`));
        setFullName('');
        setEmail('');
        setMobileNumber('');
      } else {
        setError(data.error || t('Could not create account.', 'खाते तयार करता आले नाही.'));
      }
    } catch {
      setError(t('Request failed. Please try again.', 'विनंती अयशस्वी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card-static p-6 max-w-lg">
      <h3 className="text-lg font-semibold text-black mb-4">{t('Create Staff Account', 'कर्मचारी खाते तयार करा')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Full Name', 'पूर्ण नाव')}</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('Enter full name', 'पूर्ण नाव प्रविष्ट करा')} className="w-full h-11 rounded-xl border border-[#E7E7E4] px-3 text-sm focus:border-black focus:ring-2 focus:ring-black/10 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Email', 'ईमेल')}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" className="w-full h-11 rounded-xl border border-[#E7E7E4] px-3 text-sm focus:border-black focus:ring-2 focus:ring-black/10 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Mobile Number (optional)', 'मोबाईल नंबर (पर्यायी)')}</label>
          <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="w-full h-11 rounded-xl border border-[#E7E7E4] px-3 text-sm focus:border-black focus:ring-2 focus:ring-black/10 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Role', 'भूमिका')}</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-11 rounded-xl border border-[#E7E7E4] px-3 text-sm focus:border-black focus:ring-2 focus:ring-black/10 outline-none">
            {staffRoleOptions.map((opt) => <option key={opt.value} value={opt.value}>{language === 'en' ? opt.labelEn : opt.labelMr}</option>)}
          </select>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</div>}

        <button type="submit" disabled={isLoading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-55">
          {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : <UserPlus className="h-4 w-4" />}
          {t('Create Account', 'खाते तयार करा')}
        </button>
      </form>
    </div>
  );
}

function LinkParentStudentPanel({ language, t }: { language: string; t: (en: string, mr: string) => string }) {
  void language;
  const [parentMobileOrId, setParentMobileOrId] = useState('');
  const [studentIdsText, setStudentIdsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resolvedParent, setResolvedParent] = useState<{ id: string; name: string } | null>(null);

  const resolveParent = async () => {
    setError('');
    setSuccess('');
    setResolvedParent(null);
    if (!parentMobileOrId.trim()) {
      setError(t('Enter parent mobile number or user ID.', 'पालक मोबाईल नंबर किंवा वापरकर्ता आयडी प्रविष्ट करा.'));
      return;
    }

    try {
      const response = await fetch(`/api/admin/lookup-parent?q=${encodeURIComponent(parentMobileOrId.trim())}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok && data.success && data.parent) {
        setResolvedParent({ id: data.parent.id, name: data.parent.name_en || data.parent.username });
      } else {
        setError(data.error || t('Parent not found.', 'पालक सापडला नाही.'));
      }
    } catch {
      setError(t('Failed to look up parent.', 'पालक शोधता आला नाही.'));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const parentId = resolvedParent?.id || parentMobileOrId.trim();
    if (!parentId) {
      setError(t('Parent user ID is required.', 'पालक वापरकर्ता आयडी आवश्यक आहे.'));
      return;
    }

    const studentIds = studentIdsText
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(Boolean);

    if (studentIds.length === 0) {
      setError(t('At least one student ID is required.', 'किमान एक विद्यार्थी आयडी आवश्यक आहे.'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/link-parent-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentUserId: parentId, studentIds }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(t(
          `Linked ${data.linkedStudentIds?.length || studentIds.length} student(s) to parent successfully.`,
          `${data.linkedStudentIds?.length || studentIds.length} विद्यार्थी पालकाशी यशस्वीरित्या जोडले.`
        ));
        setStudentIdsText('');
        setResolvedParent(null);
        setParentMobileOrId('');
      } else {
        setError(data.error || t('Could not link parent to students.', 'पालकाला विद्यार्थ्यांशी जोडता आले नाही.'));
      }
    } catch {
      setError(t('Request failed. Please try again.', 'विनंती अयशस्वी. कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card-static p-6 max-w-lg">
      <h3 className="text-lg font-semibold text-black mb-4">{t('Link Parent to Students', 'पालकाला विद्यार्थ्यांशी जोडा')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Parent Mobile Number or User ID', 'पालक मोबाईल नंबर किंवा वापरकर्ता आयडी')}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={parentMobileOrId}
              onChange={(e) => { setParentMobileOrId(e.target.value); setResolvedParent(null); }}
              placeholder={t('e.g. 9876543210 or UUID', 'उदा. 9876543210 किंवा UUID')}
              className="flex-1 h-11 rounded-xl border border-[#E7E7E4] px-3 text-sm focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
            />
            <button
              type="button"
              onClick={resolveParent}
              className="px-3 h-11 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200 border border-slate-200"
            >
              {t('Lookup', 'शोधा')}
            </button>
          </div>
          {resolvedParent && (
            <p className="mt-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
              {t('Found:', 'सापडले:')} {resolvedParent.name} ({resolvedParent.id.slice(0, 8)}...)
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{t('Student IDs (comma-separated)', 'विद्यार्थी आयडी (स्वल्पविरामाने वेगळे)')}</label>
          <textarea
            value={studentIdsText}
            onChange={(e) => setStudentIdsText(e.target.value)}
            placeholder={t('Enter student UUIDs, one per line or comma-separated', 'विद्यार्थी UUID प्रविष्ट करा, प्रति ओळ एक किंवा स्वल्पविरामाने वेगळे')}
            rows={3}
            className="w-full rounded-xl border border-[#E7E7E4] px-3 py-2.5 text-sm focus:border-black focus:ring-2 focus:ring-black/10 outline-none resize-none"
          />
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</div>}

        <button type="submit" disabled={isLoading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-55">
          {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : <Link className="h-4 w-4" />}
          {t('Link Parent to Students', 'पालकाला विद्यार्थ्यांशी जोडा')}
        </button>
      </form>
    </div>
  );
}

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  created_at: string;
  safety_status?: string | null;
  safety_score?: number | null;
}

function GalleryUploadPanel({ t }: { t: (en: string, mr: string) => string }) {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [safetyWarning, setSafetyWarning] = useState('');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  const fetchGalleryImages = () => {
    setImagesLoading(true);
    fetch('/api/gallery')
      .then(res => res.json())
      .then(result => setGalleryImages(result.data || []))
      .catch(() => {})
      .finally(() => setImagesLoading(false));
  };

  useEffect(() => { fetchGalleryImages(); }, []);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSafetyWarning('');

    if (!imageFile) { setError(t('Please select an image file.', 'कृपया एक प्रतिमा फाइल निवडा.')); return; }
    if (imageFile.size > 10 * 1024 * 1024) { setError(t('Image too large (max 10MB).', 'प्रतिमा खूप मोठी आहे (कमाल 10MB).')); return; }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
      });
      reader.readAsDataURL(imageFile);
      const base64Data = await base64Promise;

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Data,
          filename: imageFile.name,
          caption: caption.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (response.ok && data.data) {
        // Run content safety analysis on the uploaded image
        const imageUrl = data.data.url || data.data.image_url;
        if (imageUrl) {
          try {
            const safetyRes = await fetch('/api/content/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl }),
            });
            const safetyData = await safetyRes.json();
            if (safetyRes.ok && safetyData.safe === false) {
              setSafetyWarning(t(
                `Content flagged as potentially unsafe (score: ${safetyData.score?.toFixed(2)}). Reasons: ${safetyData.reasons?.join(', ') || 'Unknown'}`,
                `सामग्री संभाव्यतः असुरक्षित म्हणून चिन्हांकित (स्कोअर: ${safetyData.score?.toFixed(2)}). कारणे: ${safetyData.reasons?.join(', ') || 'अज्ञात'}`
              ));
            }
          } catch {
            // Content safety check failed silently - image still uploaded
          }
        }

        setSuccess(t('Image uploaded successfully!', 'प्रतिमा यशस्वीरित्या अपलोड झाली!'));
        setCaption('');
        setImageFile(null);
        fetchGalleryImages();
      } else {
        setError(data.error || t('Upload failed.', 'अपलोड अयशस्वी.'));
      }
    } catch {
      setError(t('Upload request failed.', 'अपलोड विनंती अयशस्वी.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('Delete this image?', 'ही प्रतिमा हटवायची?'))) return;
    try {
      const response = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setGalleryImages(prev => prev.filter(img => img.id !== id));
      }
    } catch { /* ignore */ }
  };

  const getSafetyBadge = (status: string | null | undefined) => {
    if (!status || status === 'approved') {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">{t('Safe', 'सुरक्षित')}</span>;
    }
    if (status === 'pending') {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200">{t('Pending', 'प्रलंबित')}</span>;
    }
    if (status === 'rejected' || status === 'flagged') {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-50 text-red-700 border border-red-200">{t('Flagged', 'चिन्हांकित')}</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="glass-card-static p-6 max-w-lg">
        <h3 className="text-lg font-semibold text-black mb-4">{t('Upload School Photos', 'शाळेचे फोटो अपलोड करा')}</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{t('Select Image', 'प्रतिमा निवडा')}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full h-11 rounded-xl border border-[#E7E7E4] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{t('Caption (optional)', 'शीर्षक (पर्यायी)')}</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={t('Enter image caption', 'प्रतिमा शीर्षक प्रविष्ट करा')} className="w-full h-11 rounded-xl border border-[#E7E7E4] px-3 text-sm focus:border-black focus:ring-2 focus:ring-black/10 outline-none" />
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
          {safetyWarning && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {safetyWarning}
            </div>
          )}
          {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</div>}

          <button type="submit" disabled={isLoading || !imageFile} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-55">
            {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : <Image className="h-4 w-4" />}
            {t('Upload Image', 'प्रतिमा अपलोड करा')}
          </button>
        </form>
      </div>

      {/* Existing gallery images */}
      <div className="glass-card-static p-6">
        <h3 className="text-lg font-semibold text-black mb-4">{t('Gallery Images', 'गॅलरी प्रतिमा')}</h3>
        {imagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          </div>
        ) : galleryImages.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">{t('No images uploaded yet.', 'अद्याप कोणत्याही प्रतिमा अपलोड केल्या नाहीत.')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galleryImages.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-[#E7E7E4]">
                <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-32 object-cover" />
                <div className="px-2 py-1 flex items-center justify-between gap-1">
                  {img.caption && <p className="text-xs text-slate-600 truncate flex-1">{img.caption}</p>}
                  {getSafetyBadge(img.safety_status)}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationsPanel({ t }: { t: (en: string, mr: string) => string }) {
  const [applications, setApplications] = useState<Array<{ id: string; applicant_name: string; parent_name: string; parent_mobile: string; parent_email: string | null; standard_applying: number | null; status: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/applications')
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(result => setApplications(result.data || []))
      .catch(() => setError(t('Failed to load applications.', 'अर्ज लोड करता आले नाहीत.')))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected' | 'reviewed') => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      }
    } catch {
      // Silently fail
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="glass-card-static overflow-hidden">
      <div className="p-4 border-b border-slate-200/50">
        <h3 className="text-lg font-semibold text-black">{t('Admission Applications', 'प्रवेश अर्ज')}</h3>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          <span className="ml-3 text-sm text-[#6B6B6B]">{t('Loading applications...', 'अर्ज लोड होत आहेत...')}</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-[#6B6B6B]">{t('No applications submitted yet.', 'अद्याप कोणतेही अर्ज सबमिट केले नाहीत.')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="portal-table w-full text-sm">
            <thead style={{ background: 'rgba(248, 250, 252, 0.8)' }} className="border-b border-slate-200/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Date', 'तारीख')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Student', 'विद्यार्थी')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Parent', 'पालक')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Mobile', 'मोबाईल')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Standard', 'इयत्ता')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Status', 'स्थिती')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Actions', 'क्रिया')}</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => (
                <tr key={app.id} className={`border-b border-slate-100/50 hover:bg-amber-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/30'}`}>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{app.applicant_name}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-600">{app.parent_name}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{app.parent_mobile}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-600">{app.standard_applying || '-'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      app.status === 'reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {(app.status === 'pending' || app.status === 'submitted') ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatusChange(app.id, 'approved')}
                          disabled={actionLoading === app.id}
                          className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                          title={t('Approve', 'मंजूर करा')}
                        >
                          <CheckCircle className="w-3 h-3 inline mr-0.5" />
                          {t('Approve', 'मंजूर')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          disabled={actionLoading === app.id}
                          className="px-2 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-medium border border-red-200 hover:bg-red-100 disabled:opacity-50"
                          title={t('Reject', 'नाकारा')}
                        >
                          <XCircle className="w-3 h-3 inline mr-0.5" />
                          {t('Reject', 'नाकारा')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'reviewed')}
                          disabled={actionLoading === app.id}
                          className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                          title={t('Mark Reviewed', 'पुनरावलोकन केले')}
                        >
                          {t('Review', 'पुनरावलोकन')}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminCenter() {
  const { language } = useAppContext();
  const t = (en: string, mr: string) => (language === 'en' ? en : mr);
  const [activeTab, setActiveTab] = useState<AdminTab>('events');

  // Event Approvals state
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [eventActionLoading, setEventActionLoading] = useState<string | null>(null);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [logFilterUser, setLogFilterUser] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('');
  const [logFilterFrom, setLogFilterFrom] = useState('');
  const [logFilterTo, setLogFilterTo] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);

  // Fetch events from API
  const fetchEvents = useCallback(() => {
    setEventsLoading(true);
    setEventsError('');
    fetch('/api/admin/events?status=all')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
      })
      .then(result => setEvents(result.data || []))
      .catch(() => setEventsError(t('Failed to load events.', 'कार्यक्रम लोड करता आले नाहीत.')))
      .finally(() => setEventsLoading(false));
  }, [language]);

  // Fetch audit logs with filters
  const fetchAuditLogs = useCallback(() => {
    setLogsLoading(true);
    setLogsError('');
    const params = new URLSearchParams();
    if (logFilterUser.trim()) params.set('user', logFilterUser.trim());
    if (logFilterAction) params.set('action', logFilterAction);
    if (logFilterFrom) params.set('from', logFilterFrom);
    if (logFilterTo) params.set('to', logFilterTo);
    params.set('page', String(logPage));
    params.set('perPage', '50');

    fetch(`/api/admin/audit-logs?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(result => {
        setAuditLogs(result.data || []);
        setLogTotalPages(result.totalPages || 1);
      })
      .catch(() => setLogsError(t('Failed to load audit logs.', 'ऑडिट नोंदी लोड करता आल्या नाहीत.')))
      .finally(() => setLogsLoading(false));
  }, [logFilterUser, logFilterAction, logFilterFrom, logFilterTo, logPage, language]);

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    }
  }, [activeTab, fetchEvents]);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchAuditLogs]);

  const handleApprove = async (id: string) => {
    setEventActionLoading(id);
    try {
      const res = await fetch(`/api/admin/events/${id}/approve`, { method: 'PATCH' });
      if (res.ok) {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' as const } : e));
      }
    } catch {
      // Silently fail
    } finally {
      setEventActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setEventActionLoading(id);
    try {
      const res = await fetch(`/api/admin/events/${id}/reject`, { method: 'PATCH' });
      if (res.ok) {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' as const } : e));
      }
    } catch {
      // Silently fail
    } finally {
      setEventActionLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="portal-page"
    >
      <div className="portal-heading">
        <p className="portal-kicker">{t('SYSTEM HEALTH & AUDIT', 'प्रणाली आरोग्य व ऑडिट')}</p>
        <h2 className="portal-title">{t('Security Dashboard', 'सुरक्षा डॅशबोर्ड')}</h2>
        <p className="portal-subtitle">{t('Review operational health, approvals and administrative records.', 'प्रणाली आरोग्य, मंजुरी आणि प्रशासकीय नोंदींचा आढावा घ्या.')}</p>
      </div>

      {/* System Health - Glass Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card-static p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('Server', 'सर्व्हर')}</p>
            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t('Healthy', 'सक्रिय')}
            </p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card-static p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('Database', 'डेटाबेस')}</p>
            <p className="text-sm font-semibold text-blue-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {t('Connected', 'कनेक्टेड')}
            </p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card-static p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
            <Wifi className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('Network', 'नेटवर्क')}</p>
            <p className="text-sm font-semibold text-amber-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {t('Stable', 'स्थिर')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Tabs - Glass */}
      <div className="segmented-control">
        <button
          onClick={() => setActiveTab('events')}
          aria-pressed={activeTab === 'events'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'events' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <CheckCircle className="w-4 h-4" />
          {t('Event Approvals', 'कार्यक्रम मंजुरी')}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          aria-pressed={activeTab === 'audit'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'audit' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <Shield className="w-4 h-4" />
          {t('Audit Logs', 'ऑडिट लॉग')}
        </button>
        <button
          onClick={() => setActiveTab('students')}
          aria-pressed={activeTab === 'students'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'students' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <GraduationCap className="w-4 h-4" />
          {t('Student Management', 'विद्यार्थी व्यवस्थापन')}
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          aria-pressed={activeTab === 'accounts'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'accounts' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <UserPlus className="w-4 h-4" />
          {t('Create Account', 'खाते तयार करा')}
        </button>
        <button
          onClick={() => setActiveTab('linking')}
          aria-pressed={activeTab === 'linking'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'linking' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <Link className="w-4 h-4" />
          {t('Link Parent', 'पालक जोडा')}
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          aria-pressed={activeTab === 'gallery'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'gallery' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <Image className="w-4 h-4" />
          {t('Gallery', 'गॅलरी')}
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          aria-pressed={activeTab === 'applications'}
          className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold ${activeTab === 'applications' ? 'segmented-active' : 'text-[#545f73]'}`}
        >
          <FileText className="w-4 h-4" />
          {t('Applications', 'अर्ज')}
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="space-y-3">
          {eventsLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              <span className="ml-3 text-sm text-[#6B6B6B]">{t('Loading events...', 'कार्यक्रम लोड होत आहेत...')}</span>
            </div>
          ) : eventsError ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-red-600">{eventsError}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-[#6B6B6B]">{t('No events found.', 'कोणतेही कार्यक्रम सापडले नाहीत.')}</p>
            </div>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.id}
                layout
                whileHover={{ scale: 1.01 }}
                className={`glass-card-static p-5 transition-all ${
                  event.status === 'approved' ? 'border-emerald-200' :
                  event.status === 'rejected' ? 'border-red-200' :
                  ''
                }`}
                style={
                  event.status === 'approved' ? { background: 'rgba(236, 253, 245, 0.7)' } :
                  event.status === 'rejected' ? { background: 'rgba(254, 242, 242, 0.7)' } :
                  {}
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {/* Timeline dot */}
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        event.status === 'approved' ? 'bg-emerald-500' :
                        event.status === 'rejected' ? 'bg-red-500' :
                        'bg-amber-400'
                      }`} />
                      <h4 className="font-semibold text-slate-800">
                        {event.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-6">
                      <span className="font-medium">{event.event_date ? new Date(event.event_date).toLocaleDateString() : '-'}</span>
                      {event.description ? ` - ${event.description}` : ''}
                    </p>
                    {event.status !== 'pending' && (
                      <span className={`inline-block mt-2 ml-6 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {event.status === 'approved' ? t('Approved', 'मंजूर') : t('Rejected', 'नाकारले')}
                      </span>
                    )}
                  </div>
                  {event.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(event.id)}
                        disabled={eventActionLoading === event.id}
                        className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50"
                        title={t('Approve', 'मंजूर करा')}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(event.id)}
                        disabled={eventActionLoading === event.id}
                        className="p-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                        title={t('Reject', 'नाकारा')}
                      >
                        <XCircle className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="glass-card-static p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{t('Filters', 'फिल्टर')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('User', 'वापरकर्ता')}</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={logFilterUser}
                    onChange={(e) => { setLogFilterUser(e.target.value); setLogPage(1); }}
                    placeholder={t('Search user...', 'वापरकर्ता शोधा...')}
                    className="w-full h-9 rounded-lg border border-[#E7E7E4] pl-8 pr-3 text-xs focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('Action Type', 'क्रिया प्रकार')}</label>
                <select
                  value={logFilterAction}
                  onChange={(e) => { setLogFilterAction(e.target.value); setLogPage(1); }}
                  className="w-full h-9 rounded-lg border border-[#E7E7E4] px-3 text-xs focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
                >
                  <option value="">{t('All Actions', 'सर्व क्रिया')}</option>
                  {Object.keys(actionColors).map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('From Date', 'पासून')}</label>
                <input
                  type="date"
                  value={logFilterFrom}
                  onChange={(e) => { setLogFilterFrom(e.target.value); setLogPage(1); }}
                  className="w-full h-9 rounded-lg border border-[#E7E7E4] px-3 text-xs focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('To Date', 'पर्यंत')}</label>
                <input
                  type="date"
                  value={logFilterTo}
                  onChange={(e) => { setLogFilterTo(e.target.value); setLogPage(1); }}
                  className="w-full h-9 rounded-lg border border-[#E7E7E4] px-3 text-xs focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="glass-card-static overflow-hidden">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                <span className="ml-3 text-sm text-[#6B6B6B]">{t('Loading audit logs...', 'ऑडिट नोंदी लोड होत आहेत...')}</span>
              </div>
            ) : logsError ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-red-600">{logsError}</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-[#6B6B6B]">{t('No audit logs found.', 'कोणत्याही ऑडिट नोंदी सापडल्या नाहीत.')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="portal-table w-full text-sm">
                    <thead style={{ background: 'rgba(248, 250, 252, 0.8)' }} className="border-b border-slate-200/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          <Clock className="w-3 h-3 inline mr-1 relative -top-px" />{t('Timestamp', 'वेळ')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          <User className="w-3 h-3 inline mr-1 relative -top-px" />{t('User', 'वापरकर्ता')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          <Activity className="w-3 h-3 inline mr-1 relative -top-px" />{t('Action', 'कृती')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('IP Address', 'IP पत्ता')}</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('Details', 'तपशील')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((entry, idx) => (
                        <tr key={entry.id} className={`border-b border-slate-100/50 hover:bg-amber-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/30'}`}>
                          <td className="px-4 py-2.5 text-xs font-mono text-slate-500">
                            {new Date(entry.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{entry.username || '-'}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${actionColors[entry.action] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {entry.action}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{entry.ip_address || '-'}</td>
                          <td className="px-4 py-2.5 text-xs text-slate-600 max-w-[200px] truncate">{entry.details || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {logTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/50">
                    <button
                      onClick={() => setLogPage(p => Math.max(1, p - 1))}
                      disabled={logPage <= 1}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('Previous', 'मागील')}
                    </button>
                    <span className="text-xs text-slate-500">
                      {t('Page', 'पृष्ठ')} {logPage} / {logTotalPages}
                    </span>
                    <button
                      onClick={() => setLogPage(p => Math.min(logTotalPages, p + 1))}
                      disabled={logPage >= logTotalPages}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('Next', 'पुढील')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <AdminCrudPanel />
      )}

      {activeTab === 'accounts' && (
        <CreateStaffAccountPanel language={language} t={t} />
      )}

      {activeTab === 'linking' && (
        <LinkParentStudentPanel language={language} t={t} />
      )}

      {activeTab === 'gallery' && (
        <GalleryUploadPanel t={t} />
      )}

      {activeTab === 'applications' && (
        <ApplicationsPanel t={t} />
      )}
    </motion.div>
  );
}
