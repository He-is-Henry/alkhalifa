import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class QuizQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true })
  correctAnswer: number; // index of correct option

  @Prop({ default: '' })
  explanation: string;
}

export type QuizDocument = Quiz & Document;

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ type: Types.ObjectId, ref: 'Note', required: true })
  noteId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: [QuizQuestion], default: [] })
  questions: QuizQuestion[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
