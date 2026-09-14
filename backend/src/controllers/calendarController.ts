import { Request, Response } from 'express';
import CalendarEvent from '../models/CalendarEvent';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await CalendarEvent.find().sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar events', error });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const event = new CalendarEvent(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating calendar event', error });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating calendar event', error });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting calendar event', error });
  }
};
