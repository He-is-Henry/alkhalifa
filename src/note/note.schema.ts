import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema({ timestamps: true })
export class Note {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ClassModel',
    required: true,
  })
  classId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 3 })
  term: number;

  @Prop({ required: true, min: 1, max: 10 })
  weekNum: number;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: [String], default: [] })
  objectives: string[];

  @Prop({ default: '' })
  content: string; // HTML string from rich text editor

  @Prop({ default: '' })
  summary: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

// A week slot should only have one note
NoteSchema.index(
  { classId: 1, subjectId: 1, term: 1, weekNum: 1 },
  { unique: true },
);
