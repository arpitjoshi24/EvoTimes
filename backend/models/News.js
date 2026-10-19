
const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: [String],
      required: true,
      validate: {
        validator: (paragraphs) =>
          paragraphs.length > 0 &&
          paragraphs.every((p) => typeof p === "string" && p.trim().length > 0),
        message: "At least one non-empty content paragraph is required",
      },
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Top Stories",
        "AI & ML",
        "Cyber Security",
        "Future Tech",
        "Gaming",
        "Innovation",
        "Careers",
        "Networking",
      ],
    },
    author: {
      type: String,
      default: "EvoTimes Editorial",
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("News", newsSchema);
