import { Schema , model} from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  googleId: {
    type: String,
    required: true
  },
  profileImage: {
        type: String
    }
},{
    timestamps: true,
    versionKey: false
})


export const UserModel = model("User", UserSchema);