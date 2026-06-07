import express from 'express';
import auth from '../middleware/auth.js';
import About from '../models/About.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Certificate from '../models/Certificate.js';
import Message from '../models/Message.js';

const router = express.Router();

// Apply auth middleware to protect all routes in this router
router.use(auth);

// @route   GET /api/admin/summary
// @desc    Get counts and stats for admin dashboard
// @access  Private
router.get('/summary', async (req, res) => {
  try {
    const projectsCount = await Project.countDocuments();
    const skillsCount = await Skill.countDocuments();
    const certificatesCount = await Certificate.countDocuments();
    const unreadMessagesCount = await Message.countDocuments({ isRead: false });

    res.json({
      projectsCount,
      skillsCount,
      certificatesCount,
      unreadMessagesCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching summary statistics.' });
  }
});

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

// @route   PUT /api/admin/profile
// @desc    Create or update profile settings
// @access  Private
router.put('/profile', async (req, res) => {
  const { name, title, bio, heroBio, avatarUrl, aboutAvatarUrl, resumeUrl, socialLinks, location } = req.body;

  if (!name || !bio) {
    return res.status(400).json({ message: 'Name and biography are required.' });
  }

  try {
    let profile = await About.findOne();

    if (profile) {
      // Update
      profile.name = name;
      profile.title = title || profile.title;
      profile.bio = bio;
      profile.heroBio = heroBio !== undefined ? heroBio : profile.heroBio;
      profile.avatarUrl = avatarUrl !== undefined ? avatarUrl : profile.avatarUrl;
      profile.aboutAvatarUrl = aboutAvatarUrl !== undefined ? aboutAvatarUrl : profile.aboutAvatarUrl;
      profile.resumeUrl = resumeUrl !== undefined ? resumeUrl : profile.resumeUrl;
      profile.socialLinks = socialLinks || profile.socialLinks;
      profile.location = location || profile.location;
      await profile.save();
    } else {
      // Create new
      profile = new About({
        name,
        title: title || [],
        bio,
        heroBio,
        avatarUrl,
        aboutAvatarUrl,
        resumeUrl,
        socialLinks: socialLinks || {},
        location
      });
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile details.' });
  }
});

// ==========================================
// SKILLS MANAGEMENT
// ==========================================

// @route   POST /api/admin/skills
// @desc    Create a skill
// @access  Private
router.post('/skills', async (req, res) => {
  const { name, category, level, icon, description, isFeatured, order } = req.body;

  if (!name || !category || !level) {
    return res.status(400).json({ message: 'Name, category, and level are required.' });
  }

  try {
    const newSkill = new Skill({
      name,
      category,
      level,
      icon,
      description,
      isFeatured: isFeatured || false,
      order: order || 0
    });

    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating skill.' });
  }
});

// @route   PUT /api/admin/skills/:id
// @desc    Edit a skill
// @access  Private
router.put('/skills/:id', async (req, res) => {
  const { name, category, level, icon, description, isFeatured, order } = req.body;

  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    skill.name = name || skill.name;
    skill.category = category || skill.category;
    skill.level = level || skill.level;
    skill.icon = icon !== undefined ? icon : skill.icon;
    skill.description = description !== undefined ? description : skill.description;
    skill.isFeatured = isFeatured !== undefined ? isFeatured : skill.isFeatured;
    skill.order = order !== undefined ? order : skill.order;

    await skill.save();
    res.json(skill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating skill.' });
  }
});

// @route   DELETE /api/admin/skills/:id
// @desc    Remove a skill
// @access  Private
router.delete('/skills/:id', async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }
    res.json({ message: 'Skill deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting skill.' });
  }
});

// @route   PUT /api/admin/skills/:id/reorder
// @desc    Update display order of a skill
// @access  Private
router.put('/skills/:id/reorder', async (req, res) => {
  const { order } = req.body;
  if (order === undefined) {
    return res.status(400).json({ message: 'Order field is required.' });
  }

  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    skill.order = order;
    await skill.save();
    res.json(skill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reordering skill.' });
  }
});

// ==========================================
// PROJECTS MANAGEMENT
// ==========================================

// @route   POST /api/admin/projects
// @desc    Create a project
// @access  Private
router.post('/projects', async (req, res) => {
  const { title, description, image, category, tags, demoUrl, githubUrl, order } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Title, description, and category are required.' });
  }

  try {
    const newProject = new Project({
      title,
      description,
      image,
      category,
      tags: tags || [],
      demoUrl,
      githubUrl,
      order: order || 0
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project.' });
  }
});

// @route   PUT /api/admin/projects/:id
// @desc    Edit a project
// @access  Private
router.put('/projects/:id', async (req, res) => {
  const { title, description, image, category, tags, demoUrl, githubUrl, order } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.image = image !== undefined ? image : project.image;
    project.category = category || project.category;
    project.tags = tags || project.tags;
    project.demoUrl = demoUrl !== undefined ? demoUrl : project.demoUrl;
    project.githubUrl = githubUrl !== undefined ? githubUrl : project.githubUrl;
    project.order = order !== undefined ? order : project.order;

    await project.save();
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating project.' });
  }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Remove a project
// @access  Private
router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting project.' });
  }
});

// ==========================================
// CERTIFICATES MANAGEMENT
// ==========================================

// @route   POST /api/admin/certificates
// @desc    Create a certificate
// @access  Private
router.post('/certificates', async (req, res) => {
  const { title, issuer, issueDate, credentialId, credentialUrl, image } = req.body;

  if (!title || !issuer || !issueDate) {
    return res.status(400).json({ message: 'Title, issuer, and issue date are required.' });
  }

  try {
    const newCertificate = new Certificate({
      title,
      issuer,
      issueDate: new Date(issueDate),
      credentialId,
      credentialUrl,
      image
    });

    await newCertificate.save();
    res.status(201).json(newCertificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating certificate.' });
  }
});

// @route   PUT /api/admin/certificates/:id
// @desc    Edit a certificate
// @access  Private
router.put('/certificates/:id', async (req, res) => {
  const { title, issuer, issueDate, credentialId, credentialUrl, image } = req.body;

  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    certificate.title = title || certificate.title;
    certificate.issuer = issuer || certificate.issuer;
    certificate.issueDate = issueDate ? new Date(issueDate) : certificate.issueDate;
    certificate.credentialId = credentialId !== undefined ? credentialId : certificate.credentialId;
    certificate.credentialUrl = credentialUrl !== undefined ? credentialUrl : certificate.credentialUrl;
    certificate.image = image !== undefined ? image : certificate.image;

    await certificate.save();
    res.json(certificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating certificate.' });
  }
});

// @route   DELETE /api/admin/certificates/:id
// @desc    Remove a certificate
// @access  Private
router.delete('/certificates/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }
    res.json({ message: 'Certificate deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting certificate.' });
  }
});

// ==========================================
// INBOX MANAGEMENT
// ==========================================

// @route   GET /api/admin/messages
// @desc    Get all visitor messages (newest first)
// @access  Private
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving messages.' });
  }
});

// @route   PUT /api/admin/messages/:id
// @desc    Toggle isRead status for a message
// @access  Private
router.put('/messages/:id', async (req, res) => {
  const { isRead } = req.body;
  if (isRead === undefined) {
    return res.status(400).json({ message: 'isRead field is required.' });
  }

  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    message.isRead = isRead;
    await message.save();
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating message status.' });
  }
});

// @route   DELETE /api/admin/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    res.json({ message: 'Message deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting message.' });
  }
});

export default router;
