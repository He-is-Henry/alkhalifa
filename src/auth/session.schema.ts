import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  refreshToken: string;

  @Prop()
  deviceInfo?: string; // optional, useful for "logout all devices"

  @Prop({ required: true })
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Fast lookup on refresh
SessionSchema.index({ refreshToken: 1 });

// Easy "get all sessions for user" + "logout all"
SessionSchema.index({ userId: 1 });

// Auto-delete expired sessions — MongoDB TTL index
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
