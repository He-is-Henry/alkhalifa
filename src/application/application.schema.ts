import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({ required: true })
  childFullName: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop()
  stateOfOrigin?: string;

  @Prop({ required: true })
  religion: string;

  @Prop()
  previousSchool?: string;

  @Prop({ required: true })
  parentTitle: string;

  @Prop({ required: true })
  parentName: string;

  @Prop()
  fatherNationality?: string;

  @Prop()
  fatherStateOfOrigin?: string;

  @Prop()
  fatherOccupation?: string;

  @Prop()
  fatherPhone?: string;

  @Prop()
  fatherEmail?: string;

  @Prop()
  motherNationality?: string;

  @Prop()
  motherStateOfOrigin?: string;

  @Prop()
  motherOccupation?: string;

  @Prop()
  motherPhone?: string;

  @Prop()
  motherEmail?: string;

  @Prop({ required: true })
  residentialAddress: string;

  @Prop({ required: true })
  childLivesWith: string;

  @Prop({ type: [String], default: [] })
  illnesses: string[];

  @Prop({ type: [String], default: [] })
  inoculations: string[];

  @Prop()
  otherVaccinations?: string;

  @Prop()
  hospitalAdmissions?: string;

  @Prop()
  surgicalOperations?: string;

  @Prop()
  otherConditions?: string;

  @Prop({ required: true })
  whyAlkhalifah: string;

  @Prop({ required: true, default: 'pending' })
  status: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
