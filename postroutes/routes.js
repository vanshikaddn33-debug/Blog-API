const express = require("express");
const Post = require("../models/post");
const authMiddleware = require("../middleware/authmiddleware.js");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {title, content} = req.body;

        if (!title || !title.trim() || !content || !content.trim()) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const newPost = new Post({
            title : title.trim(),
            content : content.trim(),
            author: req.user.userId
        });

        await newPost.save();

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


router.get("/", async (req, res) => {
    try {
        const posts = await Post.find();

        res.status(200).json(posts);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
          return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.status(200).json(post);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


router.put("/:id", authMiddleware, async (req, res) => {
    try {
        

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
              return res.status(400).json({
              message: "Invalid post ID"
            });
          }

        const {title, content} = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        
        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to update this post"
            });
        }

        if (title !== undefined && !title.trim()) {
           return res.status(400).json({
           message: "Title cannot be empty"
          });
          }

        if (content !== undefined && !content.trim()) {
           return res.status(400).json({
           message: "Content cannot be empty"
          });
        }



        //we have to now update the post
        post.title = title || post.title;
        post.content = content || post.content;

        await post.save();

        res.status(200).json({
            message: "Post updated successfully",
            post: post
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


router.delete("/:id", authMiddleware, async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }


        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        
        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this post"
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;