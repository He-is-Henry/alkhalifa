import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClassDocument = ClassModel & Document;

@Schema({ timestamps: true })
export class ClassModel {
  @Prop({ required: true, trim: true })
  name: string; // "Basic 1"

  @Prop({ required: true, enum: ['lower', 'upper'] })
  level: string; // lower = Basic 1-3, upper = Basic 4-6

  @Prop({ required: true })
  order: number; // for sorting 1-6
}

export const ClassSchema = SchemaFactory.createForClass(ClassModel);
