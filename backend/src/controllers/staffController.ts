import { Request, Response } from 'express';
import StaffProfileModel from '../models/StaffProfile';
import UserModel, { UserRole } from '../models/User';
import SubjectModel from '../models/Subject';
import { isValidEmail, isValidPhone, isValidDate, isNonNegativeNumber } from '../utils/validation';

export const getStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { getPaginationParams, paginate } = require('../utils/pagination');
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req.query);
    
    const query: any = { isDeleted: { $ne: true } };
    if (req.query.department) query.department = req.query.department;
    if (req.query.designation) query.designation = req.query.designation;

    const total = await StaffProfileModel.countDocuments(query);
    const staff = await StaffProfileModel.find(query)
      .populate('user', 'name username email role')
      .populate('subject', 'name code type')
      .populate('assignedSubjects', 'name code type')
      .populate('assignedClasses', 'name section')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    if (req.query.page) {
      res.json(paginate(staff, total, page, limit));
    } else {
      res.json(staff);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, username, password, email, // User fields
      employeeId, department, subject, assignedSubjects, designation, joiningDate, qualification, experienceYears, salary, phone, address, assignedClasses // Profile fields
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ message: 'Staff name must be at least 2 characters long' });
      return;
    }

    if (!email || !isValidEmail(email)) {
      res.status(400).json({ message: 'A valid email address is required for staff account login' });
      return;
    }

    if (!employeeId || typeof employeeId !== 'string' || !employeeId.trim()) {
      res.status(400).json({ message: 'Employee ID is required' });
      return;
    }

    if ((!department || typeof department !== 'string' || !department.trim()) && !subject) {
      res.status(400).json({ message: 'Subject is required' });
      return;
    }

    if (salary !== undefined && salary !== '' && !isNonNegativeNumber(salary)) {
      res.status(400).json({ message: 'Salary must be a non-negative number' });
      return;
    }

    if (experienceYears !== undefined && experienceYears !== '' && !isNonNegativeNumber(experienceYears)) {
      res.status(400).json({ message: 'Experience years must be a non-negative number' });
      return;
    }

    if (phone && !isValidPhone(phone)) {
      res.status(400).json({ message: 'Please provide a valid phone number (7-15 digits)' });
      return;
    }

    if (joiningDate && !isValidDate(joiningDate)) {
      res.status(400).json({ message: 'Please provide a valid joining date' });
      return;
    }

    // Resolve Subject by ID or Name
    let resolvedSubjectId: any = subject || null;
    let resolvedDeptName = department ? department.trim() : '';

    if (subject) {
      const foundSub = await SubjectModel.findById(subject);
      if (foundSub) {
        resolvedDeptName = foundSub.name;
        resolvedSubjectId = foundSub._id;
      }
    } else if (department) {
      const foundSub = await SubjectModel.findOne({
        $or: [
          { _id: department.match(/^[0-9a-fA-F]{24}$/) ? department : null },
          { name: department.trim() }
        ]
      });
      if (foundSub) {
        resolvedDeptName = foundSub.name;
        resolvedSubjectId = foundSub._id;
      }
    }

    // 1. Create User
    const newUser = new UserModel({
      name: name.trim(),
      username: (username || email).trim(),
      password: password || employeeId.trim(),
      email: email.trim(),
      role: UserRole.TEACHER
    });
    await newUser.save();

    // 2. Create Profile
    const newProfile = new StaffProfileModel({
      user: newUser._id,
      employeeId: employeeId.trim(),
      department: resolvedDeptName || 'General',
      subject: resolvedSubjectId || undefined,
      assignedSubjects: assignedSubjects || (resolvedSubjectId ? [resolvedSubjectId] : []),
      designation: designation ? designation.trim() : 'Teacher',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      qualification,
      experienceYears: experienceYears ? Number(experienceYears) : 0,
      salary: salary ? Number(salary) : 0,
      phone: phone ? phone.trim() : undefined,
      address: address ? address.trim() : undefined,
      assignedClasses: assignedClasses || []
    });
    
    try {
      await newProfile.save();
    } catch (profileError) {
      await UserModel.findByIdAndDelete(newUser._id);
      throw profileError;
    }

    const populated = await newProfile.populate([
      'user', 
      'subject',
      'assignedSubjects',
      { path: 'assignedClasses', select: 'name section' }
    ]);
    res.status(201).json(populated);
  } catch (error: any) {
    if (error.code === 11000) {
      let field = 'Field';
      if (error.message.includes('email_1')) field = 'Email';
      else if (error.message.includes('username_1')) field = 'Username';
      else if (error.message.includes('employeeId_1')) field = 'Employee ID';
      
      res.status(400).json({ message: `${field} already exists in the system.` });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, email, // User fields
      employeeId, department, subject, assignedSubjects, designation, joiningDate, qualification, experienceYears, salary, phone, address, assignedClasses
    } = req.body;

    if (email && !isValidEmail(email)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    if (phone && !isValidPhone(phone)) {
      res.status(400).json({ message: 'Please provide a valid phone number (7-15 digits)' });
      return;
    }

    if (salary !== undefined && salary !== '' && !isNonNegativeNumber(salary)) {
      res.status(400).json({ message: 'Salary must be a non-negative number' });
      return;
    }

    if (experienceYears !== undefined && experienceYears !== '' && !isNonNegativeNumber(experienceYears)) {
      res.status(400).json({ message: 'Experience years must be a non-negative number' });
      return;
    }

    if (joiningDate && !isValidDate(joiningDate)) {
      res.status(400).json({ message: 'Please provide a valid joining date' });
      return;
    }

    const profile = await StaffProfileModel.findById(req.params.id);
    if (!profile) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    if (name || email) {
      const userUpdate: any = {};
      if (name) userUpdate.name = name.trim();
      if (email) userUpdate.email = email.trim();
      await UserModel.findByIdAndUpdate(profile.user, userUpdate);
    }

    // Resolve Subject if updated
    let resolvedSubjectId: any = subject !== undefined ? (subject || null) : profile.subject;
    let resolvedDeptName = department ? department.trim() : profile.department;

    if (subject) {
      const foundSub = await SubjectModel.findById(subject);
      if (foundSub) {
        resolvedDeptName = foundSub.name;
        resolvedSubjectId = foundSub._id;
      }
    } else if (department && department !== profile.department) {
      const foundSub = await SubjectModel.findOne({
        $or: [
          { _id: department.match(/^[0-9a-fA-F]{24}$/) ? department : null },
          { name: department.trim() }
        ]
      });
      if (foundSub) {
        resolvedDeptName = foundSub.name;
        resolvedSubjectId = foundSub._id;
      }
    }

    await StaffProfileModel.findByIdAndUpdate(req.params.id, {
      employeeId: employeeId ? employeeId.trim() : profile.employeeId,
      department: resolvedDeptName,
      subject: resolvedSubjectId,
      assignedSubjects: assignedSubjects !== undefined ? assignedSubjects : profile.assignedSubjects,
      designation: designation ? designation.trim() : profile.designation,
      joiningDate: joiningDate ? new Date(joiningDate) : profile.joiningDate,
      qualification: qualification !== undefined ? qualification : profile.qualification,
      experienceYears: experienceYears !== undefined ? Number(experienceYears) : profile.experienceYears,
      salary: salary !== undefined ? Number(salary) : profile.salary,
      phone: phone !== undefined ? phone.trim() : profile.phone,
      address: address !== undefined ? address.trim() : profile.address,
      assignedClasses: assignedClasses !== undefined ? assignedClasses : profile.assignedClasses
    });

    const updatedProfile = await StaffProfileModel.findById(req.params.id)
      .populate('user', 'name username email role')
      .populate('subject', 'name code type')
      .populate('assignedSubjects', 'name code type')
      .populate('assignedClasses', 'name section');
    res.json(updatedProfile);
  } catch (error: any) {
    if (error.code === 11000) {
      let field = 'Field';
      if (error.message.includes('email_1')) field = 'Email';
      else if (error.message.includes('username_1')) field = 'Username';
      else if (error.message.includes('employeeId_1')) field = 'Employee ID';
      
      res.status(400).json({ message: `${field} already exists in the system.` });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const bulkImportStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staff } = req.body; // Array of staff objects

    if (!Array.isArray(staff) || staff.length === 0) {
      res.status(400).json({ message: 'No staff data provided' });
      return;
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const item of staff) {
      try {
        const { 
          name, email, employeeId, department, designation, 
          joiningDate, qualification, experienceYears, salary, phone, address 
        } = item;

        if (!name || !employeeId || !department) {
          skippedCount++;
          errors.push(`Skipped row: Missing Name, Employee ID, or Department/Subject`);
          continue;
        }

        // Check if staff already exists
        const emailToCheck = email || `${employeeId}@staff.school.com`;
        const existingUser = await UserModel.findOne({ $or: [{ username: employeeId }, { email: emailToCheck }] });
        const existingProfile = await StaffProfileModel.findOne({ employeeId });
        if (existingUser || existingProfile) {
          skippedCount++;
          errors.push(`Skipped ${name}: Employee ID (${employeeId}) or Email already exists.`);
          continue;
        }

        const generatedEmail = email || `${employeeId}@staff.school.com`;
        const username = generatedEmail;
        const password = employeeId;

        // 1. Create User
        const newUser = new UserModel({
          name,
          username,
          password,
          email: generatedEmail,
          role: UserRole.TEACHER
        });
        await newUser.save();

        // 2. Create Profile
        const newProfile = new StaffProfileModel({
          user: newUser._id,
          employeeId,
          department,
          designation: designation || 'Teacher',
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          qualification: qualification || 'Bachelor Degree',
          experienceYears: experienceYears ? Number(experienceYears) : 0,
          salary: salary ? Number(salary) : 0,
          phone: phone || 'N/A',
          address: address || 'N/A',
          assignedClasses: []
        });
        
        try {
          await newProfile.save();
        } catch (profileError) {
          await UserModel.findByIdAndDelete(newUser._id);
          throw profileError;
        }

        importedCount++;
      } catch (err: any) {
        skippedCount++;
        errors.push(`Error importing ${item.name || 'row'}: ${err.message}`);
      }
    }

    res.json({
      message: `Bulk staff import completed: ${importedCount} imported, ${skippedCount} skipped.`,
      importedCount,
      skippedCount,
      errors
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await StaffProfileModel.findById(req.params.id);
    if (!profile) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }
    
    // Delete linked user account
    await UserModel.findByIdAndUpdate(profile.user, { isDeleted: true, deletedAt: new Date() });
    await StaffProfileModel.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    
    res.json({ message: 'Staff member and account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
