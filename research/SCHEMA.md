# Research output schema (one JSON file per university)

Write valid JSON (UTF-8, Thai text OK) to research/data/<slug>.json:

{
  "university": "<slug>",              // spu | utcc | dpu | bu | rsu
  "collected_at": "2026-11-06",         // ISO date of collection
  "activities": [{                      // student activities + recruitment activities (online or on campus)
    "title": "...", "type": "open_house|camp|workshop|competition|admission_event|student_activity|webinar|other",
    "faculty": "<faculty key or all>", "start_date": "YYYY-MM-DD|null", "end_date": "YYYY-MM-DD|null",
    "location": "...|null", "target": "e.g. ม.4-ม.6 / เด็กสายอาชีพ / ทั่วไป", "summary": "1-2 sentences Thai",
    "source_url": "https://..."
  }],
  "scholarships": [{                    // scholarships/discounts used to attract new students
    "name": "...", "value_text": "e.g. ลด 50% ตลอดหลักสูตร / 100,000 บาท", "value_pct": 50 | null,
    "conditions": "GPA / talent / conditions in Thai", "tcas_round": "portfolio|quota|admission|direct|all|unknown",
    "faculty": "<faculty key or all>", "valid_from": "YYYY-MM-DD|null", "valid_to": "YYYY-MM-DD|null",
    "source_url": "https://..."
  }],
  "pr_messages": [{                     // headlines / slogans / campaign messages used in PR
    "channel": "website|facebook|instagram|tiktok|youtube|news|ads",
    "headline": "exact headline/slogan (short)", "keywords": ["kw1","kw2"],
    "theme": "career|tech_ai|international|price|lifestyle|industry_partner|creative|other",
    "faculty": "<faculty key or all>", "date": "YYYY-MM-DD|null", "source_url": "https://..."
  }],
  "offline_events": [{                  // booths/roadshows/fairs off campus
    "event_name": "...", "venue": "...", "province": "...", "date": "YYYY-MM-DD|null",
    "event_type": "edu_fair|school_roadshow|exhibition|open_house|other", "faculty": "<faculty key or all>",
    "summary": "...", "source_url": "https://..."
  }],
  "faculty_map": [{ "competitor_faculty": "official Thai name", "spu_faculty": "<faculty key>" }],
  "notes": "caveats, gaps, what could not be found"
}

Faculty keys (SPU's 7 focus faculties):
digital_media = ดิจิทัลมีเดีย / นิเทศ / สื่อ / ดิจิทัลอาร์ต / แอนิเมชัน / เกม
it = เทคโนโลยีสารสนเทศ / คอมพิวเตอร์ / Data / AI / Cybersecurity
tourism = ท่องเที่ยว / การบริการ / โรงแรม / การบิน
architecture = สถาปัตยกรรม / ออกแบบภายใน
engineering = วิศวกรรมศาสตร์
liberal_arts = ศิลปศาสตร์ / ภาษา / ภาษาอังกฤษ / ภาษาจีน
business = บริหารธุรกิจ / การตลาด / บัญชี / ผู้ประกอบการ / โลจิสติกส์
all = whole university / not faculty-specific
Skip faculties outside these 7 (e.g. law, medicine) unless the item is university-wide.
