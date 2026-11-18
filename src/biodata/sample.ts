import { emptyBiodata, type BiodataData } from './model';

/** Sample data for previews. Not a real person. */
export function sampleBiodata(photo = ''): BiodataData {
  const d = emptyBiodata();
  Object.assign(d, {
    photo, name: 'Ayesha Rahman', dob: '12 May 1999', age: '26', height: "5'4\"", weight: '52 kg', complexion: 'Fair', bloodGroup: 'B+', religion: 'Islam', maritalStatus: 'Never married',
    occupation: 'Lecturer', employer: 'Dhaka University', father: 'Md. Abdur Rahman', fatherOcc: 'Retired banker', mother: 'Rahima Begum', motherOcc: 'Homemaker',
    brothers: '1', sisters: '1', familyType: 'Middle class, nuclear', presentAddress: 'Dhanmondi, Dhaka', permanentAddress: 'Jashore Sadar',
    about: 'Calm, family-oriented and career minded. I enjoy reading, travelling with family and cooking on weekends.',
    expectations: 'Educated, respectful and kind, with a stable career and a family-first outlook.',
    guardianName: 'Md. Abdur Rahman', guardianRelation: 'Father', phone: '01700-000000', email: 'name@example.com',
  });
  d.education = [{ id: 'e1', degree: 'MA in English', institution: 'SUST', year: '2022' }, { id: 'e2', degree: 'BA in English', institution: 'SUST', year: '2020' }];
  return d;
}

/** Plain placeholder portrait (SVG), so previews show a photo slot without any real person's picture. */
export const SAMPLE_PHOTO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="250"><rect width="200" height="250" fill="#9aa"/><circle cx="100" cy="95" r="40" fill="#dde"/><rect x="45" y="150" width="110" height="100" rx="40" fill="#dde"/></svg>');
