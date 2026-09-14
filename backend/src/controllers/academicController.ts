import { Request, Response } from 'express';
import ClassModel from '../models/Class';
import SubjectModel from '../models/Subject';

// --- CLASSES ---
export const getClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const classes = await ClassModel.find().populate("batch", "name startDate endDate status").populate("classTeacher", "name email username").sort({ name: 1, section: 1 }).lean();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import { isPositiveNumber } from '../utils/validation';

export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, section, capacity, batch, classTeacher, periodStructures } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ message: 'Class name is required' });
      return;
    }

    if (!section || typeof section !== 'string' || !section.trim()) {
      res.status(400).json({ message: 'Section is required' });
      return;
    }

    if (!isPositiveNumber(capacity)) {
      res.status(400).json({ message: 'Class capacity must be at least 1' });
      return;
    }

    const batchId = batch?._id || (typeof batch === 'string' && batch.trim() ? batch : undefined);
    const classTeacherId = classTeacher?._id || (typeof classTeacher === 'string' && classTeacher.trim() ? classTeacher : undefined);

    const newClass = new ClassModel({
      name: name.trim(),
      section: section.trim().toUpperCase(),
      capacity: Number(capacity),
      batch: batchId,
      classTeacher: classTeacherId,
      periodStructures: Array.isArray(periodStructures) ? periodStructures : []
    });
    await newClass.save();
    const populated = await newClass.populate([{ path: "batch", select: "name" }, { path: "classTeacher", select: "name username" }]);
    res.status(201).json(populated);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'This Class and Section already exists.' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, section, capacity, batch, classTeacher, periodStructures } = req.body;

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      res.status(400).json({ message: 'Class name is required' });
      return;
    }

    if (section !== undefined && (!section || typeof section !== 'string' || !section.trim())) {
      res.status(400).json({ message: 'Section is required' });
      return;
    }

    if (capacity !== undefined && !isPositiveNumber(capacity)) {
      res.status(400).json({ message: 'Class capacity must be at least 1' });
      return;
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (section !== undefined) updateFields.section = section.trim().toUpperCase();
    if (capacity !== undefined) updateFields.capacity = Number(capacity);
    if (batch !== undefined) {
      updateFields.batch = batch?._id || (typeof batch === 'string' && batch.trim() ? batch : null);
    }
    if (classTeacher !== undefined) {
      updateFields.classTeacher = classTeacher?._id || (typeof classTeacher === 'string' && classTeacher.trim() ? classTeacher : null);
    }
    if (periodStructures !== undefined) {
      updateFields.periodStructures = Array.isArray(periodStructures) ? periodStructures : [];
    }

    const updated = await ClassModel.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    )
      .populate("batch", "name startDate endDate status")
      .populate("classTeacher", "name email username")
      .lean();
    if (!updated) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'This Class and Section already exists.' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteClass = async (req: Request, res: Response): Promise<void> => {
  try {
    await ClassModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- SUBJECTS ---
export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const subjects = await SubjectModel.find().populate("assignedClass", "name section").sort({ name: 1 }).lean();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, type, assignedClass } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ message: 'Subject name is required' });
      return;
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ message: 'Subject code is required' });
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type: type || 'Theory',
      assignedClass: assignedClass || null
    };
    const newSubject = new SubjectModel(payload);
    await newSubject.save();
    const populated = await newSubject.populate("assignedClass", "name section");
    res.status(201).json(populated);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Subject code already exists.' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, type, assignedClass } = req.body;

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      res.status(400).json({ message: 'Subject name is required' });
      return;
    }

    if (code !== undefined && (!code || typeof code !== 'string' || !code.trim())) {
      res.status(400).json({ message: 'Subject code is required' });
      return;
    }

    const payload: any = {};
    if (name) payload.name = name.trim();
    if (code) payload.code = code.trim().toUpperCase();
    if (type) payload.type = type;
    if (assignedClass !== undefined) payload.assignedClass = assignedClass || null;

    const updated = await SubjectModel.findByIdAndUpdate(req.params.id, payload, { new: true })
      .lean();
    if (!updated) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Subject code already exists.' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    await SubjectModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
