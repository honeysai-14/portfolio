import express from 'express';
import rateLimit from 'express-rate-limit';
import About from '../models/About.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Certificate from '../models/Certificate.js';
import Message from '../models/Message.js';

const router = express.Router();

// Rate limiter for contact submissions: max 5 messages per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many messages sent from this IP, please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// @route   GET /api/health
// @desc    Get API health status
// @access  Public
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// @route   GET /api/profile
// @desc    Get about/profile info
// @access  Public
router.get('/profile', async (req, res) => {
  try {
    const profile = await About.findOne();
    if (!profile) {
      // Return a default placeholder if DB is fresh and not yet configured
      return res.json({
        name: "HoneySai K",
        title: ["Full-Stack Engineer", "UI/UX Designer", "MERN Developer"],
        bio: "Passionate software engineer focused on building elegant, high-performance, and visually stunning web applications. Experienced in React, Node.js, Express, MongoDB, and modern cloud infrastructures. I love turning complex problems into simple, beautiful, and intuitive designs.",
        heroBio: "Passionate software engineer focused on building elegant, high-performance, and visually stunning web applications. I love turning complex problems into simple, beautiful, and intuitive designs.",
        avatarUrl: "/uploads/narsimulu_avatar.png",
        aboutAvatarUrl: "/uploads/narsimulu_avatar.png",
        resumeUrl: "",
        socialLinks: {
          github: "https://github.com",
          linkedin: "https://linkedin.com",
          twitter: "https://twitter.com",
          email: "honey.sai@example.com"
        },
        location: "Hyderabad, India"
      });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching profile data.' });
  }
});

// @route   GET /api/skills
// @desc    Get all skills sorted by category and order
// @access  Public
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, order: 1 });
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching skills.' });
  }
});

// @route   GET /api/projects
// @desc    Get all projects sorted by order
// @access  Public
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching projects.' });
  }
});

// @route   GET /api/certificates
// @desc    Get all certificates sorted by date
// @access  Public
router.get('/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ issueDate: -1 });
    res.json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching certificates.' });
  }
});

// @route   POST /api/contact
// @desc    Submit form message
// @access  Public (Rate-limited)
router.post('/contact', contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message fields are required.' });
  }

  try {
    const newMessage = new Message({
      name,
      email,
      subject: subject || 'No Subject',
      message
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message.' });
  }
});

export default router;
