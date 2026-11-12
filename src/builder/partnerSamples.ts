// Starting content for a new client CV, by profession: a top-tier design plus realistic English sample text.
// Every sample line a partner must replace carries "(sample - replace)": a CV that still has it is never counted as delivered.
import type { ProfessionId } from '../../shared/partner';
import { SAMPLE_MARK } from '../../shared/partner';
import { ACCENTS, emptyCv, fresherCv, newEducation, newExperience, newTraining, type BuilderState, type DesignId } from './model';

const M = `(${SAMPLE_MARK})`;

interface Seed {
  design: DesignId;
  accent: string;
  headline: string;
  summary: string;
  skills: string;
  languages: string;
  role: string;
  org: string;
  bullets: string[];
  degree: string;
  major: string;
  institution: string;
  result: string;
  training?: string;
  personal?: boolean;
}

const SEEDS: Record<ProfessionId, Seed> = {
  fresher: {
    design: 'fresher', accent: ACCENTS[1], headline: 'Fresh Graduate, Business Administration',
    summary: 'BBA graduate (CGPA 3.40) with strong Excel, English communication and teamwork skills from university projects and a 3-month internship. Seeking an entry-level role in banking, sales or administration.',
    skills: 'MS Excel, MS Word, English communication, Teamwork, Time management, Customer handling', languages: 'Bangla (native), English (good)',
    role: 'Intern', org: 'ABC Company Ltd.', bullets: ['Prepared daily sales reports in Excel for a team of 8', 'Handled 30+ customer calls a day with polite, clear answers', 'Helped organise 2 events with 150+ participants'],
    degree: 'BBA', major: 'Management', institution: 'Your University', result: 'CGPA 3.40/4.00',
  },
  nurse: {
    design: 'care', accent: ACCENTS[2], headline: 'Registered Nurse, Diploma in Nursing',
    summary: 'Registered nurse with 3 years of ward and emergency experience. Safe medication handling, patient monitoring and clear reporting to doctors and families. Ready for hospital roles at home or abroad.',
    skills: 'Patient care, IV cannulation, Vital signs monitoring, Medication administration, Wound dressing, Infection control, Patient records', languages: 'Bangla (native), English (good)',
    role: 'Staff Nurse', org: 'A Private Hospital', bullets: ['Cared for 12 to 15 patients per shift in a general ward', 'Recorded vital signs and medication on time with zero reporting errors', 'Supported emergency team during night shifts'],
    degree: 'Diploma in Nursing Science', major: 'Nursing', institution: 'A Nursing Institute', result: 'First class', training: 'Basic Life Support (BLS)',
  },
  teacher: {
    design: 'chalk', accent: ACCENTS[3], headline: 'English Teacher, Secondary Level',
    summary: 'Dedicated English teacher with 4 years of classroom experience. Plans clear lessons, raises student confidence and improves exam results through regular practice and feedback.',
    skills: 'Lesson planning, Classroom management, Spoken English coaching, Student assessment, MS Office, Parent communication', languages: 'Bangla (native), English (fluent)',
    role: 'Assistant Teacher (English)', org: 'A School / College', bullets: ['Taught English to 120+ students of Class 6 to 10', 'Raised average class result by 15% in one year', 'Ran weekly speaking clubs to build student confidence'],
    degree: 'MA', major: 'English', institution: 'Your University', result: 'CGPA 3.55/4.00', training: 'Teacher Training Certificate (B.Ed)',
  },
  banker: {
    design: 'ascent', accent: ACCENTS[0], headline: 'Officer, Retail and SME Banking',
    summary: 'Finance graduate with 2 years of front-desk banking experience. Strong in KYC, account opening and customer service. Targeting Officer and Senior Officer roles in private commercial banks.',
    skills: 'Customer service, KYC and AML, Account opening, MS Excel, Credit analysis, Cash handling, Teamwork', languages: 'Bangla (native), English (fluent)',
    role: 'Officer, Customer Service', org: 'A Private Commercial Bank', bullets: ['Served 60 to 80 customers a day with no escalated complaints', 'Opened 300+ accounts and met the branch target every quarter', 'Kept KYC files complete for two internal audits'],
    degree: 'MBA', major: 'Finance', institution: 'Your University', result: 'CGPA 3.60/4.00', training: 'AML and CFT Compliance',
  },
  merchandiser: {
    design: 'orbit', accent: ACCENTS[4], headline: 'Merchandiser, Garments and Buying House',
    summary: 'Merchandiser with 4 years in woven and knit garments. Handles buyer communication, sampling, costing and on-time shipment follow-up with factory and QC teams.',
    skills: 'Buyer communication, Costing, Sample development, TNA follow-up, Order tracking, MS Excel, Negotiation', languages: 'Bangla (native), English (good)',
    role: 'Senior Merchandiser', org: 'A Garments Company Ltd.', bullets: ['Managed 6 buyers and 40+ orders a year with 96% on-time shipment', 'Cut sample approval time by 3 days through weekly buyer calls', 'Prepared costing sheets and TNA for every order'],
    degree: 'BSc', major: 'Textile Engineering', institution: 'Your University', result: 'CGPA 3.30/4.00',
  },
  gulf: {
    design: 'passport', accent: ACCENTS[2], headline: 'Technician / Worker, Gulf Job Applicant',
    summary: 'Hardworking and disciplined worker with 5 years of experience. Reliable, follows safety rules, ready to join immediately and work in shifts. Seeking a stable job in the Gulf region.',
    skills: 'Following safety rules, Team work, Basic English and Arabic, Time discipline, Machine handling', languages: 'Bangla (native), English (basic), Arabic (basic)',
    role: 'Technician', org: 'A Company, Dhaka', bullets: ['Worked 8 to 10 hour shifts with full attendance', 'Followed all safety rules with zero accidents', 'Trained 3 new workers on daily tasks'],
    degree: 'SSC / HSC', major: 'Science', institution: 'Your School / College', result: 'GPA 4.00/5.00', personal: true,
  },
  driver: {
    design: 'road', accent: ACCENTS[5], headline: 'Professional Driver, Light and Heavy Vehicle',
    summary: 'Safe, punctual driver with 6 years on city and highway routes. Valid license, clean driving record and basic vehicle care. Ready for company, private or overseas driving jobs.',
    skills: 'Light and heavy vehicle driving, Route planning, Basic vehicle maintenance, Road safety, Punctuality, Basic English', languages: 'Bangla (native), Hindi (good), English (basic)',
    role: 'Driver', org: 'A Company / Family', bullets: ['Drove 150+ km daily with zero accidents', 'Kept the vehicle serviced and documents up to date', 'Always on time for pick-ups and drop-offs'],
    degree: 'HSC / SSC', major: '', institution: 'Your School / College', result: '', training: 'Driving License Training', personal: true,
  },
  it: {
    design: 'terminal', accent: ACCENTS[5], headline: 'Software Developer (React, Node.js)',
    summary: 'Developer with 2 years of experience building web apps with React and Node.js. Writes clean code, ships on time and works well with designers and QA.',
    skills: 'JavaScript, TypeScript, React, Node.js, REST APIs, SQL, Git, Problem solving', languages: 'Bangla (native), English (good)',
    role: 'Junior Software Engineer', org: 'A Software Company', bullets: ['Built 5 customer dashboards used by 2,000+ users', 'Reduced page load time by 40% with code splitting', 'Wrote tests that cut bug reports by a third'],
    degree: 'BSc', major: 'Computer Science and Engineering', institution: 'Your University', result: 'CGPA 3.50/4.00',
  },
  ngo: {
    design: 'corporate', accent: ACCENTS[0], headline: 'Program Officer, Development and NGO',
    summary: 'Program officer with 4 years in community development. Skilled in field monitoring, donor reporting, training and working with local partners.',
    skills: 'Project monitoring, Donor reporting, Training facilitation, Data collection (KoBo), Community engagement, MS Excel, Report writing', languages: 'Bangla (native), English (fluent)',
    role: 'Program Officer', org: 'An NGO / Development Organisation', bullets: ['Supported 1,200 households across 3 upazilas', 'Prepared monthly and quarterly donor reports on time', 'Trained 150+ community volunteers'],
    degree: 'MSS', major: 'Development Studies', institution: 'Your University', result: 'CGPA 3.60/4.00', training: 'Monitoring and Evaluation (M&E)',
  },
  sales: {
    design: 'spark', accent: ACCENTS[1], headline: 'Sales Executive, FMCG and Corporate Sales',
    summary: 'Target-driven sales executive with 3 years of field and corporate experience. Builds long-term client relationships and consistently beats monthly targets.',
    skills: 'Lead generation, Negotiation, Client relationship, CRM, Presentation, MS Excel, Target achievement', languages: 'Bangla (native), English (good)',
    role: 'Sales Executive', org: 'A Company Ltd.', bullets: ['Achieved 112% of the yearly sales target', 'Opened 45 new retail and corporate accounts', 'Kept 90% of key clients for repeat orders'],
    degree: 'BBA', major: 'Marketing', institution: 'Your University', result: 'CGPA 3.45/4.00',
  },
  abroad: {
    design: 'scholar', accent: ACCENTS[6], headline: 'Applicant for Study / Work Abroad',
    summary: 'Motivated graduate with a strong academic record, research and volunteer experience. Seeking admission or a skilled role abroad to build international experience and return with new skills.',
    skills: 'Academic writing, Research, Data analysis, Presentation, MS Office, Teamwork', languages: 'Bangla (native), English (IELTS: add score)',
    role: 'Research Assistant', org: 'A University / Organisation', bullets: ['Collected and analysed survey data from 200+ respondents', 'Co-authored one research paper', 'Led a volunteer group of 15 students'],
    degree: 'BSc / MA', major: 'Your subject', institution: 'Your University', result: 'CGPA 3.60/4.00', personal: true,
  },
};

/** The builder state a new client CV starts from. */
export function sampleFor(profession: ProfessionId | null | undefined, clientName = ''): BuilderState {
  if (!profession) return { data: { ...emptyCv(), name: clientName }, design: 'classic', accent: ACCENTS[0] };
  const s = SEEDS[profession];
  const base = profession === 'fresher' ? fresherCv() : emptyCv();
  return {
    design: s.design,
    accent: s.accent,
    data: {
      ...base,
      name: clientName ? `${clientName} ${M}` : `Client Name ${M}`,
      headline: `${s.headline} ${M}`,
      phone: '01XXXXXXXXX', email: 'name@email.com', location: 'Dhaka',
      summary: `${M} ${s.summary}`,
      skills: s.skills,
      languages: s.languages,
      experience: [newExperience({ role: s.role, org: `${s.org} ${M}`, location: 'Dhaka', start: '2023', current: true, bullets: s.bullets.join('\n') })],
      education: [newEducation({ degree: s.degree, major: s.major, institution: `${s.institution} ${M}`, result: s.result, year: '2022' })],
      training: s.training ? [newTraining({ name: s.training, org: 'Training institute', year: '2024' })] : [],
      showPersonal: !!s.personal,
    },
  };
}
