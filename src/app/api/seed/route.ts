import { NextResponse } from "next/server";
import { saveAboutSingleton } from "@/lib/about";
import { connectDB } from "@/lib/db";
import { createSiteForUser } from "@/lib/site";
import User from "@/models/User";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Experience from "@/models/Experience";
import Education from "@/models/Education";
import Certification from "@/models/Certification";
import Contact from "@/models/Contact";
import Seo from "@/models/Seo";
import Site from "@/models/Site";

export async function GET() {
  return seed();
}

export async function POST() {
  return seed();
}

async function seed() {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_SEED_ROUTE !== "true") {
    return NextResponse.json(
      { success: false, error: "Seed route is disabled" },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    // Create admin user
    let user = await User.findOne({ email: "sujonhasan171@gmail.com" });
    if (!user) {
      user = await User.create({
        name: "Md. Sujon Hasan",
        email: "sujonhasan171@gmail.com",
        password: "admin123456",
        role: "admin",
        status: "active",
      });
    }
    const site = await createSiteForUser(user);
    await Site.findByIdAndUpdate(site._id, {
      title: "Md. Sujon Hasan Portfolio",
      publishStatus: "published",
      onboardingCompleted: true,
    });
    await User.findByIdAndUpdate(user._id, {
      status: "active",
    });
    const siteId = site._id.toString();

    // About
    await saveAboutSingleton(siteId, {
      name: "Md. Sujon Hasan",
      tagline: "Full Stack Developer (MERN Stack)",
      bio: "<p>I am a passionate Full Stack Developer specializing in the MERN stack. I love building web applications that are fast, responsive, and user-friendly. With a strong foundation in both frontend and backend technologies, I create seamless digital experiences from concept to deployment.</p><p>I am always eager to learn new technologies and take on challenging projects that push the boundaries of what's possible on the web.</p>",
      heroDescription: "Building modern web applications with cutting-edge technologies. Specializing in React, Node.js, and MongoDB.",
      profileImage: "",
      resumeUrl: "",
      resumeTemplate: "classic",
      stats: [
        { label: "Years Experience", value: "3+" },
        { label: "Projects Completed", value: "20+" },
        { label: "Happy Clients", value: "15+" },
        { label: "Technologies", value: "25+" },
      ],
      socialLinks: {
        github: "https://github.com/sujonhasan",
        linkedin: "https://linkedin.com/in/sujonhasan",
        twitter: "",
        facebook: "https://facebook.com/sujonhasan",
        website: "",
      },
    });

    // Skills
    const skills = [
      { name: "React.js", category: "frontend", proficiency: 90, icon: "SiReact", order: 1 },
      { name: "Next.js", category: "frontend", proficiency: 85, icon: "SiNextdotjs", order: 2 },
      { name: "TypeScript", category: "frontend", proficiency: 80, icon: "SiTypescript", order: 3 },
      { name: "Tailwind CSS", category: "frontend", proficiency: 90, icon: "SiTailwindcss", order: 4 },
      { name: "JavaScript", category: "frontend", proficiency: 92, icon: "SiJavascript", order: 5 },
      { name: "HTML/CSS", category: "frontend", proficiency: 95, icon: "SiHtml5", order: 6 },
      { name: "Node.js", category: "backend", proficiency: 88, icon: "SiNodedotjs", order: 7 },
      { name: "Express.js", category: "backend", proficiency: 87, icon: "SiExpress", order: 8 },
      { name: "REST API", category: "backend", proficiency: 85, icon: "SiPostman", order: 9 },
      { name: "MongoDB", category: "database", proficiency: 85, icon: "SiMongodb", order: 10 },
      { name: "MySQL", category: "database", proficiency: 70, icon: "SiMysql", order: 11 },
      { name: "Firebase", category: "database", proficiency: 75, icon: "SiFirebase", order: 12 },
      { name: "Git & GitHub", category: "tools", proficiency: 85, icon: "SiGit", order: 13 },
      { name: "Docker", category: "tools", proficiency: 60, icon: "SiDocker", order: 14 },
      { name: "VS Code", category: "tools", proficiency: 90, icon: "SiVisualstudiocode", order: 15 },
      { name: "Figma", category: "tools", proficiency: 65, icon: "SiFigma", order: 16 },
    ];
    await Skill.deleteMany({ siteId });
    await Skill.insertMany(skills.map((skill) => ({ ...skill, siteId })));

    // Projects
    const projects = [
      {
        title: "E-Commerce Platform",
        description: "<p>A full-featured e-commerce platform built with the MERN stack. Features include user authentication, product management, shopping cart, payment integration with Stripe, order tracking, and admin dashboard.</p>",
        shortDescription: "Full-featured MERN stack e-commerce with Stripe payments and admin dashboard.",
        technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe", "Redux"],
        category: "fullstack",
        featured: true,
        order: 1,
        status: "published",
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/sujonhasan",
      },
      {
        title: "Task Management App",
        description: "<p>A collaborative task management application with real-time updates. Built with Next.js and Socket.io for real-time collaboration features.</p>",
        shortDescription: "Real-time collaborative task management with Next.js and Socket.io.",
        technologies: ["Next.js", "TypeScript", "MongoDB", "Socket.io", "Tailwind CSS"],
        category: "fullstack",
        featured: true,
        order: 2,
        status: "published",
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/sujonhasan",
      },
      {
        title: "Portfolio Website",
        description: "<p>A modern, dynamic portfolio website with admin dashboard. Built with Next.js, TypeScript, and MongoDB.</p>",
        shortDescription: "Dynamic portfolio with admin dashboard built with Next.js.",
        technologies: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS", "ShadCN UI"],
        category: "frontend",
        featured: true,
        order: 3,
        status: "published",
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/sujonhasan",
      },
      {
        title: "Blog Platform",
        description: "<p>A content management system with markdown support, categories, tags, and SEO optimization.</p>",
        shortDescription: "CMS blog platform with markdown support and SEO features.",
        technologies: ["React", "Node.js", "MongoDB", "Express", "Markdown"],
        category: "fullstack",
        featured: false,
        order: 4,
        status: "published",
      },
      {
        title: "Weather Dashboard",
        description: "<p>A beautiful weather dashboard that shows current weather, forecasts, and weather maps using OpenWeatherMap API.</p>",
        shortDescription: "Weather dashboard with forecasts and interactive maps.",
        technologies: ["React", "OpenWeatherMap API", "Chart.js", "CSS Modules"],
        category: "frontend",
        featured: false,
        order: 5,
        status: "published",
      },
      {
        title: "Chat Application",
        description: "<p>Real-time chat application with private messaging, group chats, file sharing, and emoji support.</p>",
        shortDescription: "Real-time chat app with groups, file sharing, and emoji support.",
        technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Cloudinary"],
        category: "fullstack",
        featured: false,
        order: 6,
        status: "published",
      },
    ];
    await Project.deleteMany({ siteId });
    await Project.insertMany(projects.map((project) => ({ ...project, siteId })));

    // Experience
    const experiences = [
      {
        company: "Tech Solutions Ltd.",
        position: "Full Stack Developer",
        description: "<p>Leading the development of web applications using MERN stack. Collaborating with cross-functional teams to deliver high-quality software solutions. Implementing CI/CD pipelines and maintaining code quality standards.</p>",
        startDate: new Date("2022-06-01"),
        endDate: null,
        current: true,
        location: "Dhaka, Bangladesh",
        technologies: ["React", "Node.js", "MongoDB", "TypeScript", "Docker"],
        order: 1,
      },
      {
        company: "Digital Agency BD",
        position: "Frontend Developer",
        description: "<p>Developed responsive web interfaces using React.js and Tailwind CSS. Worked with UX designers to implement pixel-perfect designs. Optimized web performance and improved Core Web Vitals scores.</p>",
        startDate: new Date("2021-01-01"),
        endDate: new Date("2022-05-31"),
        current: false,
        location: "Dhaka, Bangladesh",
        technologies: ["React", "JavaScript", "Tailwind CSS", "Redux"],
        order: 2,
      },
      {
        company: "Freelance",
        position: "Web Developer",
        description: "<p>Worked on various freelance projects including e-commerce sites, landing pages, and web applications for local businesses and international clients.</p>",
        startDate: new Date("2020-01-01"),
        endDate: new Date("2020-12-31"),
        current: false,
        location: "Remote",
        technologies: ["HTML", "CSS", "JavaScript", "PHP", "WordPress"],
        order: 3,
      },
    ];
    await Experience.deleteMany({ siteId });
    await Experience.insertMany(experiences.map((experience) => ({ ...experience, siteId })));

    // Education
    const education = [
      {
        institution: "Bangladesh University of Engineering & Technology",
        degree: "Bachelor of Science",
        field: "Computer Science & Engineering",
        startDate: new Date("2018-01-01"),
        endDate: new Date("2022-12-31"),
        current: false,
        grade: "CGPA: 3.5/4.0",
        description: "Focused on software engineering, data structures, algorithms, and web technologies.",
        order: 1,
      },
      {
        institution: "Dhaka College",
        degree: "Higher Secondary Certificate (HSC)",
        field: "Science",
        startDate: new Date("2015-07-01"),
        endDate: new Date("2017-06-30"),
        current: false,
        grade: "GPA: 5.0/5.0",
        description: "",
        order: 2,
      },
    ];
    await Education.deleteMany({ siteId });
    await Education.insertMany(education.map((item) => ({ ...item, siteId })));

    // Certifications
    const certifications = [
      {
        title: "Full Stack Web Development",
        issuer: "Coursera",
        issueDate: new Date("2021-06-15"),
        credentialUrl: "https://coursera.org",
        order: 1,
      },
      {
        title: "MongoDB Developer Certification",
        issuer: "MongoDB University",
        issueDate: new Date("2022-03-20"),
        credentialUrl: "https://university.mongodb.com",
        order: 2,
      },
      {
        title: "React - The Complete Guide",
        issuer: "Udemy",
        issueDate: new Date("2021-01-10"),
        credentialUrl: "https://udemy.com",
        order: 3,
      },
    ];
    await Certification.deleteMany({ siteId });
    await Certification.insertMany(certifications.map((item) => ({ ...item, siteId })));

    // Contact
    await Contact.findOneAndUpdate(
      { siteId },
      {
        siteId,
        email: "sujonhasan171@gmail.com",
        phone: "+88 01719 707 020",
        address: "Dhaka, Bangladesh",
        availability: "Available for freelance work",
      },
      { upsert: true }
    );

    // SEO
    await Seo.findOneAndUpdate(
      { siteId, page: "home" },
      {
        siteId,
        page: "home",
        metaTitle: "Md. Sujon Hasan | Full Stack Developer (MERN Stack) | Portfolio",
        metaDescription:
          "Md. Sujon Hasan is a Full Stack Developer specializing in MERN stack. Explore 20+ projects, skills in React, Node.js, MongoDB, and professional experience.",
        keywords: [
          "Md. Sujon Hasan",
          "Full Stack Developer",
          "MERN Stack",
          "React Developer",
          "Node.js Developer",
          "Portfolio",
          "Web Developer Bangladesh",
        ],
        autoGenerate: true,
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully! Check .env.local for admin credentials.",
    });
  } catch (error) {
    console.error("Seed error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: "Failed to seed database", details: message }, { status: 500 });
  }
}
