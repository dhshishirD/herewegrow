// Realistic job ads and CVs written for testing the matcher. They follow the shape of Bangladeshi circulars; the companies are invented.

export interface Case {
  name: string;
  ad: string;
  good: string; // a CV that fits
  weak: string; // a CV that barely fits
}

export const CASES: Case[] = [
  {
    name: 'sales manager (English)',
    ad: `Assistant Manager – Sales & Distribution
Job Responsibilities
• Develop and execute sales strategies to achieve monthly targets.
• Manage distributor and retailer relationships across Dhaka.
• Prepare weekly MIS reports and sales forecasts using MS Excel.
• Lead a team of 8 sales officers.
Educational Requirements: MBA in Marketing or equivalent.
Experience Requirements: At least 4 years of experience in FMCG sales. Experience in distribution management will be preferred.
Additional Requirements: Age 28 to 35 years. Strong negotiation skills. Must be willing to travel. Proficiency in MS Office.`,
    good: `Sales Officer, ABC Foods Ltd
Work Experience
Sales Officer, ABC Foods Ltd
Jan 2020 – Present
Managed 40 distributors and 300 retailers in Dhaka North. Built weekly MIS reports in MS Excel. Led 3 sales reps and negotiated trade terms.
Education
MBA in Marketing, University of Dhaka, 2019
Skills: negotiation, MS Office, FMCG sales, distribution`,
    weak: `Fresh graduate. BBA in Management, 2025.
Education
BBA, Management, National University, 2025
Skills: teamwork, Facebook`,
  },
  {
    name: 'English teacher (Bangla)',
    ad: `সহকারী শিক্ষক (ইংরেজি) নিয়োগ
যোগ্যতা: ইংরেজিতে স্নাতকোত্তর (ন্যূনতম ২য় শ্রেণি)। বিএড বা সমমান প্রশিক্ষণপ্রাপ্ত হলে অগ্রাধিকার। কম্পিউটার চালনায় দক্ষতা থাকতে হবে। পাঠদান ও শ্রেণি ব্যবস্থাপনায় অভিজ্ঞতা। বেতন আলোচনাসাপেক্ষ।`,
    good: `আমি ইংরেজিতে এমএ করেছি। ৩ বছর স্কুলে ইংরেজি পড়িয়েছি, শ্রেণি ব্যবস্থাপনা ও কম্পিউটার জানি। বিএড সম্পন্ন করেছি।`,
    weak: `আমি বিবিএ পাস করেছি। ব্যবসা সংক্রান্ত কাজ জানি।`,
  },
  {
    name: 'accounts executive (English, Tally)',
    ad: `Accounts Executive
Requirements:
- Bachelor degree in Accounting or Finance. 
- Minimum 2 years of experience in a similar role.
- Hands-on knowledge of Tally ERP and MS Excel.
- Good understanding of VAT, TDS and bank reconciliation.
Responsibilities: Maintain day-to-day accounts, prepare monthly financial statements, handle payroll and assist auditors.
Salary: Negotiable. Interview will be held at our head office.`,
    good: `Accounts Officer, XYZ Trading
Experience
Accounts Officer, XYZ Trading
2022 – Present
Maintained ledgers in Tally, prepared VAT returns, did monthly bank reconciliation and payroll for 40 staff. Worked with external auditors.
Education
B.Com in Accounting, 2021
Skills: Tally, Excel, VAT, TDS, reconciliation`,
    weak: `Education
BSS in Sociology, 2024
Skills: communication, MS Word`,
  },
  {
    name: 'software engineer (English)',
    ad: `Software Engineer (Full Stack)
We are looking for a Software Engineer to build web applications.
Requirements
• BSc in CSE or related field.
• 2+ years of experience with React, Node.js and PostgreSQL.
• Experience with REST APIs, Git and Docker.
• Strong problem-solving and teamwork skills.
Nice to have: AWS, TypeScript, CI/CD.`,
    good: `Software Engineer, Techify
2023 – Present
Built React dashboards and Node.js REST APIs on PostgreSQL. Deployed with Docker on AWS. Daily Git workflow; solved production problems with the team.
Education
BSc in CSE, 2022
Skills: React, Node.js, TypeScript, PostgreSQL, Docker`,
    weak: `BSc in EEE, 2025
Skills: MATLAB, AutoCAD`,
  },
  {
    name: 'NGO project officer (English)',
    ad: `Project Officer – Livelihood
Responsibilities:
• Conduct field visits and monitor project activities in the working area.
• Mobilize communities and organise awareness sessions for beneficiaries.
• Collect data using KoBo and prepare monthly progress reports.
• Coordinate with local government and partner organisations.
Qualifications: Master's degree in Social Science, Development Studies or related subject. At least 3 years of relevant experience with an NGO. Experience in microfinance is preferred. Strong report writing skills in English.`,
    good: `Project Officer, a rural NGO
Experience
Project Officer, Rural Development Society
Mar 2021 – Present
Conducted field visits across 12 unions, mobilised community groups, collected data with KoBo and wrote monthly progress reports in English. Coordinated with Upazila offices.
Education
MSS in Development Studies, 2020`,
    weak: `BA Pass, 2023. Worked as shop assistant for one year.`,
  },
  {
    name: 'HR officer (mixed)',
    ad: `HR Officer (Recruitment & Admin)
দায়িত্বসমূহ: নিয়োগ প্রক্রিয়া পরিচালনা, কর্মীদের ফাইল সংরক্ষণ, বেতন প্রক্রিয়াকরণে সহায়তা।
Requirements: Bachelor/Master in HRM or Business. 2-4 years of experience. Knowledge of Bangladesh Labour Act. Good communication and MS Office skills.`,
    good: `HR Executive, Delta Garments
2021 – Present
Ran recruitment end to end, kept employee files, supported monthly payroll, applied Bangladesh Labour Act in disciplinary cases. MS Office, communication.
Education
MBA in HRM, 2020`,
    weak: `Fresh BBA graduate, 2025. Skills: Photoshop.`,
  },
  {
    name: 'electrical engineer (English)',
    ad: `Electrical Engineer (Maintenance)
Job Context: A leading manufacturing company in Gazipur.
Responsibilities:
- Plan and execute preventive maintenance of electrical equipment, panels, transformers and generators.
- Troubleshoot PLC and control circuits.
- Ensure safety compliance.
Requirements: BSc in Electrical & Electronic Engineering. 3 to 5 years of experience in a factory. Knowledge of AutoCAD preferred.`,
    good: `Maintenance Engineer, Gazipur factory
2020 – Present
Preventive maintenance of panels, transformers and PLC-controlled lines; troubleshot control circuits; enforced safety rules.
BSc in EEE, 2019. AutoCAD.`,
    weak: `Diploma in Computer Technology, 2024.`,
  },
  {
    name: 'customer service (Bangla-English)',
    ad: `Customer Service Executive (Call Center)
যোগ্যতা: স্নাতক পাস। ইংরেজি ও বাংলায় ভালো যোগাযোগ দক্ষতা। কম্পিউটারে দক্ষ। শিফটে কাজ করতে ইচ্ছুক।
Experience: Freshers can apply. Customer service experience will be an advantage.`,
    good: `Customer Care Executive, Grameen call centre
2023 – Present
Handled 80 customer calls a day in Bangla and English with good communication skills. Computer skills: MS Office, CRM.
Graduate (BA), 2022`,
    weak: `HSC pass, 2024.`,
  },
  {
    name: 'merchandiser (English)',
    ad: `Merchandiser – Garments
Responsibilities: Follow up buyer orders, prepare costing and BOM, coordinate with factory production and sourcing, ensure on-time shipment.
Requirements: Graduate in Textile or any discipline. 3+ years in RMG merchandising. Good in negotiation and Excel. Knowledge of fabric, trims and import-export documentation.`,
    good: `Merchandiser, ABC Apparels
2019 – Present
Followed buyer orders, prepared costing, coordinated sourcing and production, shipped on time. Strong in Excel, negotiated with suppliers, prepared import-export documentation for shipments. B.Sc in Textile Engineering, 2018.`,
    weak: `BBA in Finance, 2025.`,
  },
  {
    name: 'banking officer (English)',
    ad: `Management Trainee Officer – Retail Banking
Eligibility: Master's/Bachelor with good academic record. Maximum age 30 years. No experience required.
The candidate must be able to work under pressure, handle customer queries, and learn credit and KYC procedures. Good command of English and MS Office is a must. Interview will be held at head office.`,
    good: `Intern, retail banking branch
Handled customer queries, learned KYC and credit procedures. MS Office, good English. MBA in Finance, 2025.`,
    weak: `Diploma in Civil Engineering, 2023. Skills: AutoCAD, site supervision.`,
  },
  {
    name: 'data entry operator (Bangla)',
    ad: `ডাটা এন্ট্রি অপারেটর
যোগ্যতা: এইচএসসি পাস। বাংলা ও ইংরেজি টাইপিংয়ে দক্ষতা (বাংলা ২৫, ইংরেজি ৩৫ শব্দ/মিনিট)। এমএস ওয়ার্ড ও এক্সেলে কাজ জানতে হবে। ১ বছরের অভিজ্ঞতা থাকলে অগ্রাধিকার।`,
    good: `ডাটা এন্ট্রি অপারেটর হিসেবে ২ বছর কাজ করেছি। বাংলা ও ইংরেজি টাইপিং জানি। এমএস ওয়ার্ড ও এক্সেল ব্যবহার করি। এইচএসসি পাস।`,
    weak: `এসএসসি পাস। রাঁধতে পারি।`,
  },
  {
    name: 'digital marketing (English)',
    ad: `Digital Marketing Executive
You will plan and run Facebook and Google ad campaigns, write content, manage social media pages, track performance and report weekly.
Requirements: Bachelor degree in Marketing or any. 1-2 years of experience in digital marketing. Skills in Canva or Photoshop, SEO basics, copywriting. Experience with Meta Business Suite is a plus.`,
    good: `Digital Marketer, Shop Zone
2023 – Present
Ran Facebook ads and Google Ads, wrote copy, managed 4 social media pages, built weekly performance reports. Canva, SEO. BBA in Marketing, 2022.`,
    weak: `BA in English, 2024. Skills: Bangla typing.`,
  },
];
