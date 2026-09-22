import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ten server khong duoc de trong'],
      unique: true,
      trim: true,
      minlength: [2, 'Ten server tu 2 ky tu'],
      maxlength: [50, 'Ten server toi da 50 ky tu'],
    },
    ip: {
      type: String,
      required: [true, 'IP khong duoc de trong'],
      trim: true,
      match: [/^(\d{1,3}\.){3}\d{1,3}$/, 'IP khong hop le'],
    },
    group: { type: String, default: 'default', trim: true },
    cpu: { type: Number, default: 0, min: 0, max: 100 },
    ram: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['online', 'warning', 'offline'],
      default: 'online',
    },
    note: { type: String, default: '', maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Server = mongoose.model('Server', serverSchema);