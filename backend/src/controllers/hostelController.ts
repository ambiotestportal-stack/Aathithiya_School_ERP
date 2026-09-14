import { Request, Response } from 'express';
import HostelRoomModel from '../models/HostelRoom';

export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await HostelRoomModel.find()
      .populate({
        path: 'students',
        populate: { path: 'user enrolledClass', select: 'name section' }
      })
      .sort({ blockName: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import { isPositiveNumber } from '../utils/validation';

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomNumber, blockName, roomType, capacity, wardenName } = req.body;

    if (!roomNumber || typeof roomNumber !== 'string' || !roomNumber.trim()) {
      res.status(400).json({ message: 'Room number is required' });
      return;
    }

    if (!blockName || typeof blockName !== 'string' || !blockName.trim()) {
      res.status(400).json({ message: 'Block name is required' });
      return;
    }

    if (!isPositiveNumber(capacity)) {
      res.status(400).json({ message: 'Room capacity must be at least 1' });
      return;
    }

    if (!wardenName || typeof wardenName !== 'string' || !wardenName.trim()) {
      res.status(400).json({ message: 'Warden name is required' });
      return;
    }

    const newRoom = new HostelRoomModel({
      roomNumber: roomNumber.trim(),
      blockName: blockName.trim(),
      roomType: roomType || 'Boys',
      capacity: Number(capacity),
      wardenName: wardenName.trim(),
      students: [],
      currentOccupancy: 0
    });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Room number already exists in this block.' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    await HostelRoomModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const allocateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    
    const updatedRoom = await HostelRoomModel.findOneAndUpdate(
      { 
        _id: id,
        students: { $ne: studentId },
        $expr: { $lt: [{ $size: '$students' }, '$capacity'] }
      },
      { 
        $addToSet: { students: studentId },
        $inc: { currentOccupancy: 1 }
      },
      { new: true }
    );

    if (!updatedRoom) {
      // It either doesn't exist, is full, or student is already there. Let's provide a better error.
      const room = await HostelRoomModel.findById(id);
      if (!room) {
        res.status(404).json({ message: 'Room not found' });
        return;
      }
      if (room.students.includes(studentId as any)) {
        res.status(400).json({ message: 'Student is already allocated to this room' });
        return;
      }
      res.status(400).json({ message: 'Room is at full capacity' });
      return;
    }
    
    res.json(updatedRoom);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, studentId } = req.params;
    
    const updatedRoom = await HostelRoomModel.findOneAndUpdate(
      { _id: id, students: studentId } as any,
      { 
        $pull: { students: studentId },
        $inc: { currentOccupancy: -1 }
      },
      { new: true }
    );

    if (!updatedRoom) {
      res.status(400).json({ message: 'Student not found in this room' });
      return;
    }
    
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
