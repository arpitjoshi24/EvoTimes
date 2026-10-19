
const mongoose = require("mongoose");
const News = require("../models/News");

async function getAdminNews(req, res, next) {
  try {
    const articles = await News.find()
      .sort({ updatedAt: -1 })
      .select(
        "title slug description image category status author publishedAt createdAt updatedAt"
      )
      .lean();

    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminNewsById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    const article = await News.findById(req.params.id).lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAdminNews, getAdminNewsById };
