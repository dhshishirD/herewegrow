import { describe, expect, it } from 'vitest';
import { parseBiodata } from './importBiodata';

const ENGLISH = `MARRIAGE BIODATA
Ayesha Rahman

Personal Details
Date of Birth: 12 May 1999
Age: 26 years
Height: 5'4"
Blood Group: B+
Religion: Islam
Marital Status: Never Married

Education
MA in English, SUST, 2022
BSc in CSE - Dhaka University - 2020

Profession: Lecturer
Workplace: Dhaka University

Father's Name: Md. Abdur Rahman
Father's Occupation: Retired banker
Mother's Name: Rahima Begum
Mother: Homemaker
Brothers: 1
Sisters: 1
Present Address: Dhanmondi, Dhaka
Permanent Address: Jashore Sadar
Contact: 01700-000000
Email: name@example.com
`;

const BANGLA = `বিয়ের বায়োডাটা
নাম: আয়েশা রহমান
জন্ম তারিখ: ১২ মে ১৯৯৯
উচ্চতা: ৫'৪"
ধর্ম: ইসলাম
বৈবাহিক অবস্থা: অবিবাহিত
পেশা: শিক্ষক
পিতার নাম: মো. আবদুর রহমান
মাতার নাম: রহিমা বেগম
বর্তমান ঠিকানা: ধানমন্ডি, ঢাকা
`;

describe('parseBiodata', () => {
  it('fills the fields from "Label: value" lines', () => {
    const d = parseBiodata(ENGLISH).data;
    expect(d.name).toBe('Ayesha Rahman');
    expect(d.dob).toBe('12 May 1999');
    expect(d.age).toBe('26 years');
    expect(d.bloodGroup).toBe('B+');
    expect(d.maritalStatus).toBe('Never Married');
    expect(d.occupation).toBe('Lecturer');
    expect(d.employer).toBe('Dhaka University');
    expect(d.presentAddress).toBe('Dhanmondi, Dhaka');
    expect(d.permanentAddress).toBe('Jashore Sadar');
    expect(d.phone).toBe('01700-000000');
    expect(d.email).toBe('name@example.com');
  });

  it('keeps father and mother occupation apart from their names', () => {
    const d = parseBiodata(ENGLISH).data;
    expect(d.father).toBe('Md. Abdur Rahman');
    expect(d.fatherOcc).toBe('Retired banker');
    expect(d.mother).toBe('Rahima Begum');
  });

  it('reads education lines into rows', () => {
    const d = parseBiodata(ENGLISH).data;
    expect(d.education.map((e) => [e.degree, e.institution, e.year])).toEqual([
      ['MA in English', 'SUST', '2022'],
      ['BSc in CSE', 'Dhaka University', '2020'],
    ]);
  });

  it('understands Bangla labels', () => {
    const d = parseBiodata(BANGLA).data;
    expect(d.name).toBe('আয়েশা রহমান');
    expect(d.religion).toBe('ইসলাম');
    expect(d.occupation).toBe('শিক্ষক');
    expect(d.father).toBe('মো. আবদুর রহমান');
    expect(d.presentAddress).toBe('ধানমন্ডি, ঢাকা');
  });

  it('takes the value from the next line when the label stands alone', () => {
    const d = parseBiodata('Name\nRafiq Hasan\nReligion\nIslam').data;
    expect(d.name).toBe('Rafiq Hasan');
    expect(d.religion).toBe('Islam');
  });

  it('reports how many fields were filled, and none for unrelated text', () => {
    expect(parseBiodata(ENGLISH).filled).toBeGreaterThan(12);
    expect(parseBiodata('Dear sir, I am writing to apply for the post of accountant.').filled).toBe(0);
  });

  it('never invents values: a field with no match stays empty', () => {
    const d = parseBiodata('Name: Rafiq Hasan').data;
    expect(d.religion).toBe('');
    expect(d.height).toBe('');
  });
});
