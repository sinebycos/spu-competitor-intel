export const FACULTIES = {
  digital_media: "ดิจิทัลมีเดีย",
  it: "เทคโนโลยีสารสนเทศ",
  tourism: "ท่องเที่ยวและการบริการ",
  architecture: "สถาปัตยกรรมศาสตร์",
  engineering: "วิศวกรรมศาสตร์",
  liberal_arts: "ศิลปศาสตร์",
  business: "บริหารธุรกิจ",
  all: "ภาพรวมมหาวิทยาลัย",
} as const;
export type FacultyKey = keyof typeof FACULTIES;
export const FACULTY_KEYS = Object.keys(FACULTIES) as FacultyKey[];
export const FOCUS_FACULTIES = FACULTY_KEYS.filter((k) => k !== "all");

export const UNIS = {
  spu: { name: "มหาวิทยาลัยศรีปทุม", short: "SPU", label: "ศรีปทุม", color: "var(--uni-spu)", self: true },
  utcc: { name: "มหาวิทยาลัยหอการค้าไทย", short: "UTCC", label: "ม.หอการค้า", color: "var(--uni-utcc)", self: false },
  dpu: { name: "มหาวิทยาลัยธุรกิจบัณฑิตย์", short: "DPU", label: "ม.ธุรกิจบัณฑิตย์", color: "var(--uni-dpu)", self: false },
  bu: { name: "มหาวิทยาลัยกรุงเทพ", short: "BU", label: "ม.กรุงเทพ", color: "var(--uni-bu)", self: false },
  rsu: { name: "มหาวิทยาลัยรังสิต", short: "RSU", label: "ม.รังสิต", color: "var(--uni-rsu)", self: false },
} as const;
export type UniKey = keyof typeof UNIS;
export const UNI_KEYS = Object.keys(UNIS) as UniKey[];
export const COMPETITORS = UNI_KEYS.filter((k) => !UNIS[k].self);

export const KINDS = {
  activity: "กิจกรรม",
  scholarship: "ทุนการศึกษา",
  pr: "ข้อความ PR",
  offline: "บูธ / Offline",
} as const;
export type Kind = keyof typeof KINDS;

export const ACTIVITY_TYPES: Record<string, string> = {
  open_house: "Open House",
  camp: "ค่าย",
  workshop: "เวิร์กช็อป",
  competition: "การแข่งขัน",
  admission_event: "กิจกรรมรับสมัคร",
  student_activity: "กิจกรรมนักศึกษา",
  webinar: "Webinar / ออนไลน์",
  other: "อื่น ๆ",
};

export const OFFLINE_TYPES: Record<string, string> = {
  edu_fair: "งาน Education Fair",
  school_roadshow: "แนะแนวตามโรงเรียน",
  exhibition: "นิทรรศการ",
  open_house: "Open House",
  other: "อื่น ๆ",
};

export const TCAS_ROUNDS: Record<string, string> = {
  portfolio: "รอบ 1 Portfolio",
  quota: "รอบ 2 Quota",
  admission: "รอบ 3 Admission",
  direct: "รอบ 4 Direct",
  all: "ทุกรอบ",
  unknown: "ไม่ระบุรอบ",
};

export const THEMES: Record<string, string> = {
  career: "งานทำ / อาชีพ",
  tech_ai: "เทคโนโลยี / AI",
  international: "อินเตอร์ / ต่างประเทศ",
  price: "ราคา / ทุน",
  lifestyle: "ไลฟ์สไตล์ / ชีวิตมหาลัย",
  industry_partner: "พันธมิตรภาคธุรกิจ",
  creative: "ความคิดสร้างสรรค์",
  other: "อื่น ๆ",
};

export const CHANNELS: Record<string, string> = {
  website: "เว็บไซต์",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  news: "ข่าว",
  ads: "โฆษณา",
};

export const PRIORITY: Record<string, string> = { high: "ด่วน", medium: "ควรทำ", low: "ติดตาม" };
export const STATUS: Record<string, string> = {
  open: "ยังไม่เริ่ม",
  in_progress: "กำลังทำ",
  done: "เสร็จแล้ว",
  dismissed: "ไม่ทำ",
};
export const CATEGORIES: Record<string, string> = {
  scholarship: "ทุน",
  activity: "กิจกรรม",
  messaging: "ข้อความ PR",
  offline: "Offline",
  data_gap: "ช่องว่างข้อมูล",
  strategy: "กลยุทธ์",
};

export function label(map: Record<string, string>, key: string | null | undefined) {
  if (!key) return "-";
  return map[key] ?? key;
}
