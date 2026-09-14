import { Request, Response } from 'express';
import StudyMaterialModel from '../models/StudyMaterial';

export const getStudyMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId } = req.query;
    let query: any = {};
    if (classId) query.enrolledClass = classId;

    const materials = await StudyMaterialModel.find(query)
      .populate('enrolledClass', 'name section')
      .populate('subject', 'name')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createStudyMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, enrolledClass, subject, fileUrl, fileType, uploadedBy } = req.body;

    const userId = (uploadedBy && uploadedBy !== '') ? uploadedBy : (req as any).user?.id || (req as any).user?._id;

    if (!title || !title.trim()) {
      res.status(400).json({ message: 'Material Title is required' });
      return;
    }

    if (!enrolledClass || enrolledClass === '') {
      res.status(400).json({ message: 'Class selection is required' });
      return;
    }

    if (!fileUrl || !fileUrl.trim()) {
      res.status(400).json({ message: 'File or Link is required' });
      return;
    }

    if (!userId) {
      res.status(400).json({ message: 'User ID is missing' });
      return;
    }

    const payload: any = {
      title: title.trim(),
      description: description || '',
      enrolledClass,
      fileUrl,
      fileType: fileType || 'pdf',
      uploadedBy: userId
    };

    if (subject && subject !== '') {
      payload.subject = subject;
    }

    const newMaterial = new StudyMaterialModel(payload);
    await newMaterial.save();

    const populated = await newMaterial.populate([
      { path: 'enrolledClass', select: 'name section' },
      { path: 'subject', select: 'name' },
      { path: 'uploadedBy', select: 'name' }
    ]);

    res.status(201).json(populated);
  } catch (error: any) {
    console.error('Error in createStudyMaterial:', error);
    res.status(500).json({ message: 'Failed to create study material', error: error.message });
  }
};

export const deleteStudyMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    await StudyMaterialModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
