import { Request, Response } from 'express';
import NoticeModel from '../models/Notice';

export const getNotices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetAudience, classId } = req.query;
    let query: any = {};
    
    if (targetAudience || classId) {
      const orConditions: any[] = [];
      if (targetAudience) {
         orConditions.push({ targetAudience: { $in: [targetAudience, 'All', 'ALL'] } });
      } else {
         orConditions.push({ targetAudience: { $in: ['All', 'ALL'] } });
      }
      
      if (classId && classId !== 'undefined' && classId !== 'null') {
         if (Array.isArray(classId)) {
            const validIds = classId.filter(id => id && id !== 'undefined' && id !== 'null');
            if (validIds.length > 0) orConditions.push({ targetClass: { $in: validIds } });
         } else {
            orConditions.push({ targetClass: classId });
         }
      }
      query = { $or: orConditions };
    }
    
    const notices = await NoticeModel.find(query).sort({ date: -1 }).populate('targetClass', 'name section').lean();
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const newNotice = new NoticeModel(req.body);
    await newNotice.save();
    const populated = newNotice;
    const io = req.app.get('io');
    if (io) io.emit('notice_created', populated);

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    await NoticeModel.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) io.emit('notice_deleted', req.params.id);

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
