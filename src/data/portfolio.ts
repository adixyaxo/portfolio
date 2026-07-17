export interface Project {
  title: string;
  link: string;
  tags: string[];
  description: string[];
  video?: 'sera' | 'xncu';
}

export interface Writing {
  title: string;
  link: string;
  publication: string;
  date: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  quote: string;
}

export interface Experience {
  role: string;
  organization: string;
  link?: string;
  date: string;
  description: string | string[];
  image?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface PortfolioData {
  hero: {
    name: string;
    role: string;
    positioning: string;
  };
  intro: string;
  socials: SocialLink[];
  skills: {
    category: string;
    technologies: string;
  }[];
  projects: Project[];
  writing: Writing[];
  experience: Experience[];
  education: {
    institution: string;
    degree: string;
    date: string;
    score: string;
    coursework?: string;
  }[];
  achievements: string[];
}

export const portfolio: PortfolioData = {
  hero: {
    name: "Aditya Dagar",
    role: "Software Engineer — ML Systems & Low-Level Development",
    positioning: "I build high-performance systems and intelligent interfaces.",
  },
  intro: "A software engineer with a deep focus on AI/ML applications and systems-level programming. I build performant architectures that blend raw computational power with minimal, intuitive frontends.",
  socials: [
    { platform: "Email", url: "mailto:aditya0dagar@gmail.com" },
    { platform: "GitHub", url: "https://github.com/adixyaxo" },
    { platform: "LinkedIn", url: "https://www.linkedin.com/in/adixyaxoo/" },
    { platform: "X", url: "https://x.com/adixyaxo" },
    { platform: "LeetCode", url: "https://leetcode.com/u/adixyaxo/" },
    { platform: "Medium", url: "https://medium.com/@adixyaxo" },
    { platform: "Hashnode", url: "https://hashnode.com/@adixyaxo" },
    { platform: "Dev.to", url: "https://dev.to/adixyaxo" },
    { platform: "Instagram", url: "https://www.instagram.com/adixyaxo" },
    { platform: "Bluesky", url: "https://bsky.app/profile/adixyaxo.bsky.social" }
  ],
  skills: [
    { category: "Languages", technologies: "C++, C (Networking & Socket APIs), Python, JavaScript, TypeScript, SQL" },
    { category: "Web Stack", technologies: "React.js, Tailwind CSS, HTML5/CSS3, Framer Motion, Flask, FastAPI, Crow (C++)" },
    { category: "Data & Databases", technologies: "MySQL, MongoDB, NumPy, Pandas, Matplotlib, Seaborn" },
    { category: "Tools", technologies: "Git, GitHub, REST APIs, VS Code" }
  ],
  projects: [
    {
      title: "X-NCU — Campus Social Network",
      link: "https://github.com/adixyaxo/x-ncu",
      tags: ["C++", "Crow", "Vanilla JS", "HTML/CSS"],
      description: [
        "Engineered a campus-only social network from scratch in C++ using the Crow framework, handling authentication, posts, and feeds without relying on external frameworks.",
        "Designed a custom CSV-based storage engine in place of a traditional database, improving read/write throughput for low-latency feed generation.",
        "Implemented SHA-256 password hashing and JWT-based session management, improving authentication security across all campus-restricted endpoints.",
        "Delivered a real-time-like feed with a lightweight vanilla JS frontend, reducing bandwidth consumption significantly over comparable SPA approaches."
      ],
      video: 'xncu',
    },
    {
      title: "Project Sera — AI-Powered Life OS",
      link: "https://github.com/adixyaxo/the-sera",
      tags: ["MongoDB", "Express", "React", "Node.js", "Gemini API"],
      description: [
        "Architecting a distraction-free productivity platform on the MERN stack that integrates task management with context-aware AI assistance.",
        "Integrating Google's Gemini API to drive context-aware scheduling and predictive workflow automation, improving planning efficiency.",
        "Designing a high-performance RESTful API to manage complex application state and real-time data synchronization.",
        "Building a responsive React frontend optimized for low latency and seamless user interaction."
      ],
      video: 'sera',
    }
  ],
  writing: [
    {
      title: "Most Developers Use Web Servers. I Built One From Scratch in C. Here's How You Can Too",
      link: "https://medium.com/@adixyaxo/most-developers-use-web-servers-i-built-one-from-scratch-in-c-heres-how-you-can-too-13921b62d81a",
      publication: "Medium",
      date: "Jun 15, 2026",
      readTime: "6 min read",
      tags: ["C Programming", "Networking", "Backend Development", "Software Engineering"],
      excerpt: "A deep dive into building an HTTP web server from scratch using raw POSIX socket APIs in C — covering socket creation, TCP communication, HTTP request parsing, client-server architecture, and evolving the project into a practical REST-style student API. Includes source code and a curated learning resource list.",
      quote: "Instead of treating networking as a black box, I wanted to understand every layer involved in serving a web page."
    }
  ],
  experience: [
    {
      role: "Founder",
      organization: "Aency, Architectural Branding Studio",
      link: "https://aency.lovable.app/",
      date: "Present",
      image: "/exp/aency.png",
      description: [
        "Founded a premium branding studio delivering brand identity, high-converting websites, and content strategy for high-end interior designers and renovation firms.",
        "Architected and shipped the studio's web presence end-to-end, combining editorial design with performant frontend development."
      ]
    },
    {
      role: "Student Project Freelancing",
      organization: "Helping Students",
      link: "https://github.com/adixyaxo/Helping-Students",
      date: "Present",
      image: "/exp/students.png",
      description: [
        "Deliver full-stack academic projects with clean code, modern tech, and proper documentation so students can confidently walk into their viva.",
        "Built the freelancing landing page from scratch using HTML, Tailwind CSS, and vanilla JS with GSAP-powered animations, smooth scroll, and a liquid menu overlay."
      ]
    },
    {
      role: "Core Member",
      organization: "Google Developer Student Clubs, NCU",
      date: "2025 – Present",
      image: "/exp/gdsc.png",
      description: [
        "Orchestrated technical workshops and collaborated on community-driven open-source projects, elevating campus technical literacy.",
        "Contributed to university-wide initiatives focusing on full-stack development and modern deployment practices."
      ]
    },
    {
      role: "Core Team Member",
      organization: "Entrepreneurship Cell (E-Cell), NCU",
      date: "2025 – Present",
      image: "/exp/ecell.png",
      description: "Coordinated logistics and technical planning for hackathons and startup summits, driving engagement in NCU's entrepreneurial ecosystem."
    },
    {
      role: "Student Coordinator",
      organization: "International Relations Office, NCU",
      date: "2025 – Present",
      image: "/exp/iro.png",
      description: "Managed cross-cultural coordination and student affairs across international programs, strengthening communication in dynamic academic settings."
    }
  ],
  education: [
    {
      institution: "The NorthCap University",
      degree: "B.Tech, Computer Science & Engineering",
      date: "2025 – Present",
      score: "CGPA: 8.51",
      coursework: "Data Structures, Algorithms, Systems Programming, Full-Stack Development"
    },
    {
      institution: "Modern Delhi International School",
      degree: "CBSE",
      date: "",
      score: "Class XII: 75% · Class X: 90%"
    }
  ],
  achievements: [
    "JEE Mains — 91.95 Percentile, Top 9% Nationally among 1.4 million candidates."
  ]
};
