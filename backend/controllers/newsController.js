
const mongoose = require("mongoose");
const News = require("../models/News");
const generateSlug = require("../utils/generateSlug");

const categories = [
  "Top Stories",
  "AI & ML",
  "Cyber Security",
  "Future Tech",
  "Gaming",
  "Innovation",
  "Careers",
  "Networking",
];

function validateArticle(body, partial = false) {
  const errors = [];

  if (!partial || body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 200
    ) {
      errors.push("Title is required and must be at most 200 characters");
    }
  }

  if (!partial || body.description !== undefined) {
    if (
      typeof body.description !== "string" ||
      !body.description.trim() ||
      body.description.trim().length > 500
    ) {
      errors.push("Description is required and must be at most 500 characters");
    }
  }

  if (!partial || body.content !== undefined) {
    if (
      !Array.isArray(body.content) ||
      body.content.length === 0 ||
      !body.content.every(
        (paragraph) =>
          typeof paragraph === "string" && paragraph.trim().length > 0
      )
    ) {
      errors.push("Content must be a non-empty array of paragraphs");
    }
  }

  if (!partial || body.category !== undefined) {
    if (!categories.includes(body.category)) {
      errors.push("A valid category is required");
    }
  }

  if (body.image !== undefined && typeof body.image !== "string") {
    errors.push("Image must be a URL string");
  }

  if (body.author !== undefined && typeof body.author !== "string") {
    errors.push("Author must be a string");
  }

  if (
    body.status !== undefined &&
    !["draft", "published"].includes(body.status)
  ) {
    errors.push("Status must be draft or published");
  }

  return errors;
}

function articlePayload(body) {
  const payload = {};

  for (const key of [
    "title",
    "description",
    "content",
    "image",
    "category",
    "author",
    "status",
  ]) {
    if (body[key] !== undefined) payload[key] = body[key];
  }

  if (payload.title) {
    payload.title = payload.title.trim();
    payload.slug = generateSlug(payload.title);
  }

  if (payload.description) {
    payload.description = payload.description.trim();
  }

  if (payload.status === "published") {
    payload.publishedAt = new Date();
  }

  if (payload.status === "draft") {
    payload.publishedAt = null;
  }

  return payload;
}

// POST /api/news — admin only
exports.createNews = async (req, res, next) => {
  try {
    const errors = validateArticle(req.body);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const payload = articlePayload(req.body);
    const article = await News.create(payload);

    return res.status(201).json({
      success: true,
      message: "News article created",
      article,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An article with this slug already exists",
      });
    }

    next(error);
  }
};

// GET /api/news — public published news, paginated
exports.getNews = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const filter = { status: "published" };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const search = String(req.query.search).trim().slice(0, 100);
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const [articles, total] = await Promise.all([
      News.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-__v"),
      News.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      articles,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/news/:id — public published article
exports.getNewsById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid news ID",
      });
    }

    const article = await News.findOne({
      _id: req.params.id,
      status: "published",
    }).select("-__v");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    return res.status(200).json({ success: true, article });
  } catch (error) {
    next(error);
  }
};

// GET /api/news/slug/:slug — public published article
exports.getNewsBySlug = async (req, res, next) => {
  try {
    const article = await News.findOne({
      slug: req.params.slug,
      status: "published",
    }).select("-__v");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    return res.status(200).json({ success: true, article });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/news/:id — admin only
exports.updateNews = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid news ID",
      });
    }

    const errors = validateArticle(req.body, true);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const existing = await News.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    const payload = articlePayload(req.body);

    // Preserve the original publication date when editing an article
    // that remains published without explicitly changing its status.
    if (
      req.body.status === undefined &&
      existing.status === "published"
    ) {
      delete payload.publishedAt;
    }

    const article = await News.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "News article updated",
      article,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An article with this slug already exists",
      });
    }

    next(error);
  }
};

// DELETE /api/news/:id — admin only
exports.deleteNews = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid news ID",
      });
    }

    const article = await News.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "News article deleted",
    });
  } catch (error) {
    next(error);
  }
};
