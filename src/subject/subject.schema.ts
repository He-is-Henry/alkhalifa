import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true })
export class Subject {
  @Prop({ required: true, trim: true })
  name: string; // "Mathematics"

  @Prop({ required: true, trim: true })
  color: string; // hex color for UI

  @Prop({ required: true, trim: true })
  icon: string; // icon name for UI

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ClassModel',
    required: true,
  })
  classId: Types.ObjectId;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

// Compound index — a subject name should be unique per class
SubjectSchema.index({ classId: 1, name: 1 }, { unique: true });
