export const getConvertResumeContentToJsonPrompt = ({ resumeData }: { resumeData: string }) => {
  return `
convert the resume content to this JSON format:
type WorkExperience = {
  company: string;
  position: string;
  startDate: string; // Format: YYYY-MM
  endDate: string; // Format: YYYY-MM or "present"
  description: string;
  technologies: string[];
};
type Project = {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
};
type Education = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string; // Format: YYYY-MM
  endDate: string; // Format: YYYY-MM or "present"
};
type Certification = {
  name: string;
  issuer: string;
  date: string; // Format: YYYY-MM
};
type Resume = {
  title: string;
  content: string;
  totalExperience?: number;
  skills?: string[];
  workExperience?: WorkExperience[];
  projects?: Project[];
  education?: Education[];
  certifications?: Certification[];
};

Here is the resume content:
${resumeData}


Just return the JSON format of the resume content.
`
}

export const getConvertJobContentToJsonPrompt = ({ jobData }: { jobData: string }) => {
  return `
  convert the job content to this JSON format:
  
  interface JobListing {
  id: string;
  url: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  skillsRequired: string[]; 
  experienceRequired: number;
  jobType?: string;
  salary?: string;
 }

  Here is the job content:
  ${jobData}}

 Just return the JSON format of the resume content.
  `
}