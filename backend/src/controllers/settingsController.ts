import { Request, Response } from 'express';
import SchoolSettingsModel from '../models/SchoolSettings';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await SchoolSettingsModel.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new SchoolSettingsModel({
        showTimetableToStudents: true,
        showTimetableToStaff: true
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await SchoolSettingsModel.findOne();
    if (!settings) {
      settings = new SchoolSettingsModel(req.body);
    } else {
      settings.set(req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
