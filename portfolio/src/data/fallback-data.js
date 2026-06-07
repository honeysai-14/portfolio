export const fallbackProfile = {
  name: "HoneySai K",
  title: ["Full-Stack Engineer", "UI/UX Designer", "MERN Developer"],
  bio: "Passionate software engineer focused on building elegant, high-performance, and visually stunning web applications. Experienced in React, Node.js, Express, MongoDB, and modern cloud infrastructures. I love turning complex problems into simple, beautiful, and intuitive designs.",
  heroBio: "Passionate software engineer focused on building elegant, high-performance, and visually stunning web applications. I love turning complex problems into simple, beautiful, and intuitive designs.",
  avatarUrl: "/uploads/narsimulu_avatar.png",
  aboutAvatarUrl: "/uploads/narsimulu_avatar.png",
  resumeUrl: "#",
  socialLinks: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    email: "honey.sai@example.com"
  },
  location: "Hyderabad, India"
};

export const fallbackSkills = [
  // Programming Languages
  {
    _id: "s1",
    name: "JavaScript",
    category: "Programming Languages",
    level: "Expert",
    icon: "Code2",
    description: "Core language for web apps",
    isFeatured: true,
    order: 1
  },
  {
    _id: "s2",
    name: "TypeScript",
    category: "Programming Languages",
    level: "Advanced",
    icon: "FileCode",
    description: "Type safety for scalable apps",
    isFeatured: true,
    order: 2
  },
  {
    _id: "s3",
    name: "Python",
    category: "Programming Languages",
    level: "Intermediate",
    icon: "Terminal",
    description: "Scripting and backend systems",
    isFeatured: false,
    order: 3
  },
  // Frameworks
  {
    _id: "s4",
    name: "React.js",
    category: "Frameworks",
    level: "Expert",
    icon: "Atom",
    description: "Declarative component-based frontend development",
    isFeatured: true,
    order: 1
  },
  {
    _id: "s5",
    name: "Node.js / Express",
    category: "Frameworks",
    level: "Expert",
    icon: "Server",
    description: "Scalable backend routing and REST APIs",
    isFeatured: true,
    order: 2
  },
  {
    _id: "s6",
    name: "Next.js",
    category: "Frameworks",
    level: "Advanced",
    icon: "Layers",
    description: "Server-side rendering and static generation",
    isFeatured: false,
    order: 3
  },
  // Technical
  {
    _id: "s7",
    name: "MongoDB",
    category: "Technical",
    level: "Expert",
    icon: "Database",
    description: "NoSQL document database design",
    isFeatured: true,
    order: 1
  },
  {
    _id: "s8",
    name: "REST API Design",
    category: "Technical",
    level: "Expert",
    icon: "GitFork",
    description: "Building standards-compliant web APIs",
    isFeatured: true,
    order: 2
  },
  {
    _id: "s9",
    name: "Git / GitHub",
    category: "Tools",
    level: "Expert",
    icon: "Github",
    description: "Version control and collaborative pipelines",
    isFeatured: false,
    order: 1
  },
  {
    _id: "s10",
    name: "Tailwind CSS",
    category: "Tools",
    level: "Expert",
    icon: "Palette",
    description: "Utility-first responsive layouts",
    isFeatured: false,
    order: 2
  },
  {
    _id: "s11",
    name: "Problem Solving",
    category: "Soft Skills",
    level: "Expert",
    icon: "Brain",
    description: "Analytical thinking and algorithms",
    isFeatured: true,
    order: 1
  },
  {
    _id: "s12",
    name: "Collaboration",
    category: "Soft Skills",
    level: "Expert",
    icon: "Users",
    description: "Cross-functional team coordination",
    isFeatured: false,
    order: 2
  }
];

export const fallbackProjects = [
  {
    _id: "p1",
    title: "E-Commerce Cloud Platform",
    description: "A secure, modern e-commerce storefront with real-time stock updating, integrated payment processors, and a dedicated admin interface to review orders and manage inventory.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=80",
    category: "Full-Stack",
    tags: ["React", "Node.js", "Express", "MongoDB", "Stripe"],
    demoUrl: "https://example.com/demo",
    githubUrl: "https://github.com",
    order: 1
  },
  {
    _id: "p2",
    title: "Dynamic Analytics Dashboard",
    description: "A stunning data analytics board designed for marketing operations. Renders live system data with high-performance charts, filtering, customizable layouts, and theme support.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    category: "Frontend",
    tags: ["Vite", "React", "Tailwind CSS", "Recharts", "Framer Motion"],
    demoUrl: "https://example.com/demo",
    githubUrl: "https://github.com",
    order: 2
  },
  {
    _id: "p3",
    title: "Collaborative Project Task Board",
    description: "A Kanban-style task board application featuring drag-and-drop mechanics, nested subtasks, live activity logs, and real-time multiplayer updates using WebSockets.",
    image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&q=80",
    category: "Full-Stack",
    tags: ["React", "Node.js", "Socket.io", "Express", "MongoDB"],
    demoUrl: "https://example.com/demo",
    githubUrl: "https://github.com",
    order: 3
  }
];

export const fallbackCertificates = [
  {
    _id: "c1",
    title: "AWS Certified Developer – Associate",
    issuer: "Amazon Web Services",
    issueDate: "2025-08-15T00:00:00.000Z",
    credentialId: "AWS-DEV-ASSOC-99812",
    credentialUrl: "https://aws.amazon.com/verification",
    image: "https://images.unsplash.com/photo-1496096265110-f83ad7f96608?auto=format&fit=crop&w=400&q=80"
  },
  {
    _id: "c2",
    title: "MongoDB Certified Developer",
    issuer: "MongoDB Inc",
    issueDate: "2025-02-10T00:00:00.000Z",
    credentialId: "MDB-CERT-003891",
    credentialUrl: "https://mongodb.com/verification",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80"
  }
];
