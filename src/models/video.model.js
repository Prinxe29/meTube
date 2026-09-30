import mongoose, {Schema} from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
 
const videoSchema = new Schema({
    title: {
        type : String,
        required : true,
    },
    description: {
        type : String,
        required : true,
    },
    duration: {
        type : Number,
        required : true,
    },
    videoFile: {
        type : String, //cloudinary url
        required : true,
    },
    thumbnail: {
        type : String, //cloudinary url
        required : true,
    },
    owner: {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    views: {
        type : Number,
        default : 0,
    },
    isPublished: {
        type : Boolean,
        default : false,
    }
},{
    timestamps : true,
})

videoSchema.plugin(aggregatePaginate); 

export const Video = mongoose.model('Video', userSchema);