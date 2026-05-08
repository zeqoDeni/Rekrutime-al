import {
  BadgeCheck,
  Building2,
  Handshake,
  Search,
  ShieldCheck,
  UserRoundSearch,
  UsersRound,
} from 'lucide-react';

export const navItems = [
  { label: 'Punë', href: '/#jobs' },
  { label: 'Kandidatë', href: '/#candidates' },
  { label: 'Si funksionon', href: '/#si-funksionon' },
  { label: 'Kompani', href: '/#kompani' },
];

export const categories = [
  'Të gjitha',
  'Inxhinieri softueri',
  'Produkt',
  'Marketing',
  'Financa',
  'Operacione',
];

export const companyLogos = [
  'BalkanPay',
  'Aventus',
  'One Albania',
  'Patoko',
  'Softmogul',
  'MerrJep',
];

export const featuredJobs = [
  {
    title: 'Inxhinier/e Senior Frontend',
    company: 'BalkanPay',
    location: 'Hibrid, Tiranë',
    salary: 'EUR 2,000 - 2,700',
    type: 'Me kohë të plotë',
    posted: 'Publikuar sot',
    category: 'Inxhinieri softueri',
    description: 'Ndërto produkte fintech për përdorues me volum të lartë dhe cikël të shpejtë release-esh.',
    requirements: ['5+ vite React/TypeScript', 'Arkitekturë frontend', 'Përvojë me testim'],
  },
  {
    title: 'Menaxher/e Produkti',
    company: 'Aventus',
    location: 'Në zyrë, Tiranë',
    salary: 'EUR 1,700 - 2,300',
    type: 'Me kohë të plotë',
    posted: 'Publikuar 1 ditë më parë',
    category: 'Produkt',
    description: 'Drejto roadmap-in e produktit dhe bashkëpuno me dizajnin, inxhinierinë dhe biznesin.',
    requirements: ['Eksperiencë me roadmap', 'Analizë metrike', 'Komunikim me stakeholder'],
  },
  {
    title: 'Udhëheqës/e e Marketingut të Rritjes',
    company: 'Patoko',
    location: 'Në distancë, Shqipëri',
    salary: 'EUR 1,400 - 1,900',
    type: 'Me kohë të plotë',
    posted: 'Publikuar 2 ditë më parë',
    category: 'Marketing',
    description: 'Drejto eksperimentet e rritjes dhe menaxho kanalet që sjellin konvertime të qëndrueshme.',
    requirements: ['Paid acquisition', 'CRM flows', 'A/B testing'],
  },
  {
    title: 'Analist/e Finance',
    company: 'One Albania',
    location: 'Në zyrë, Tiranë',
    salary: 'EUR 1,100 - 1,450',
    type: 'Me kohë të plotë',
    posted: 'Publikuar 3 ditë më parë',
    category: 'Financa',
    description: 'Raportim financiar mujor, forecast dhe analizë performance për njësi biznesi.',
    requirements: ['Excel i avancuar', 'Raportim KPI', 'Përvojë me BI'],
  },
];

export const featuredCandidates = [
  {
    role: 'Zhvillues/e Senior React',
    location: 'Tiranë',
    experience: '6 vite',
    skills: ['React', 'TypeScript', 'Next.js'],
    availability: 'I/e lirë pas 2 javësh',
    summary: 'Ka ndërtuar produkte B2B SaaS nga zero deri në scale, me fokus te performanca dhe UI systems.',
    preferredWork: 'Hibrid',
    expectedSalary: 'EUR 2,200+',
  },
  {
    role: 'Dizajner/e Produkti',
    location: 'Në distancë, Shqipëri',
    experience: '5 vite',
    skills: ['Product Design', 'Figma', 'Design Systems'],
    availability: 'I/e lirë tani',
    summary: 'Eksperiencë në dizajn produkesh mobile/web për startup-e dhe kompani me ritëm të shpejtë.',
    preferredWork: 'Në distancë',
    expectedSalary: 'EUR 1,700+',
  },
  {
    role: 'Specialist/e Rekrutimi',
    location: 'Durrës',
    experience: '4 vite',
    skills: ['Sourcing', 'Interviewing', 'Employer Branding'],
    availability: 'I/e lirë këtë muaj',
    summary: 'Ka menaxhuar hiring volume të lartë për role teknike dhe jo-teknike në kompani lokale.',
    preferredWork: 'Në zyrë ose hibrid',
    expectedSalary: 'EUR 1,200+',
  },
];

export const heroStats = [
  { value: '8,000+', label: 'lidhje kandidatë-kompani' },
  { value: '1,500+', label: 'role aktive' },
  { value: '10,000+', label: 'kandidatë të gatshëm' },
];

export const quickSearches = ['React', 'Inxhinieri softueri', 'Në distancë', 'Tiranë', 'Marketing'];

export const howItWorksSteps = [
  {
    icon: UserRoundSearch,
    title: 'Krijo profilin',
    description: 'Vendos rolin, pritshmëritë e pagës dhe mënyrën e preferuar të punës.',
  },
  {
    icon: BadgeCheck,
    title: 'Shiko detajet qartë',
    description: 'Paga, niveli i eksperiencës dhe tipi i punës janë të dukshme para aplikimit.',
  },
  {
    icon: Search,
    title: 'Apliko me një klikim',
    description: 'Dërgo aplikimin shpejt dhe ndiq statusin pa email-e të panevojshme.',
  },
];

export const audienceCards = [
  {
    icon: UserRoundSearch,
    title: 'Për kandidatë',
    copy: 'Gjej role që përputhen me nivelin dhe objektivat e tua profesionale.',
  },
  {
    icon: Building2,
    title: 'Për kompani',
    copy: 'Publiko role dhe lidhu me kandidatë të verifikuar në tregun shqiptar.',
  },
  {
    icon: Handshake,
    title: 'Për rekrutues',
    copy: 'Menaxho procese të qarta rekrutimi me komunikim më të shpejtë.',
  },
];

export const trustItems = [
  {
    icon: ShieldCheck,
    title: 'Profile të verifikuara',
    description: 'Kandidatë dhe kompani me të dhëna të strukturuara, jo profile bosh.',
  },
  {
    icon: Building2,
    title: 'Kompani që po punësojnë tani',
    description: 'Listime aktive me data të freskëta, jo njoftime të vjetra.',
  },
  {
    icon: UsersRound,
    title: 'Proces i qartë për të dyja palët',
    description: 'Kandidati dhe kompania shohin pritshmëritë që në hapin e parë.',
  },
];

export const footerLinks = [
  {
    title: 'Platforma',
    links: [
      { label: 'Shfleto punët', href: '#jobs' },
      { label: 'Shiko kandidatët', href: '#candidates' },
      { label: 'Për kompani', href: '#kompani' },
      { label: 'Si funksionon', href: '#si-funksionon' },
    ],
  },
  {
    title: 'Resurse',
    links: [
      { label: 'Guida punësimi', href: '#si-funksionon' },
      { label: 'Këshilla CV', href: '#si-funksionon' },
      { label: 'Pyetje të shpeshta', href: '#besim' },
      { label: 'Këshilla rekrutimi', href: '#besim' },
    ],
  },
  {
    title: 'Kompania',
    links: [
      { label: 'Rreth nesh', href: '#kompani' },
      { label: 'Karriera', href: '#jobs' },
      { label: 'Kushtet', href: '#kompani' },
      { label: 'Privatësia', href: '#kompani' },
    ],
  },
];

export const marketplaceHighlights = ['Paga transparente', 'Aplikim i shpejtë', 'Kompani aktive'];
