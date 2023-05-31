const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

function result(succ, msg, details) {
  if (details) {
    return {
      success: succ,
      message: msg,
      data: details,
    };
  } else {
    return {
      success: succ,
      message: msg,
    };
  }
}

router.get("/", async (req, res) => {
  try {
    const post = await Post.aggregate([
      {
        $lookup: {
          from: "user",
          localField: "user_id",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $set: {
          id: "$_id",
          username: {
            $arrayElemAt: ["$userData.username", 0],
          },
          created_date: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M:%S",
              date: "$created_date",
              timezone: "+07:00",
            },
          },
          modified_date: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M:%S",
              date: "$modified_date",
              timezone: "+07:00",
            },
          },
        },
      },
      {
        $project: {
          userData: 0,
          _id: 0,
        },
      },
    ]);

    if (post.length > 0) {
      res.status(200).json(result(1, "Retrieve Data Success", post));
    } else {
      res.status(200).json(result(0, "Zero data"));
    }
  } catch (error) {
    res.status(500).json(result(0, error.message));
  }
});

router.post("/", async (req, res) => {
  const inputPost = new Post({
    content: req.body.content,
    user_id: req.body.user_id,
  });
  try {
    const post = await inputPost.save();
    res.status(200).json(result(1, "Insert Data Success", post));
  } catch (error) {
    res.status(500).json(result(0, error.message));
  }
});

router.put("/", async (req, res) => {
  const data = {
    id: req.body.id,
    content: req.body.content,
    modified_date: Date.now(),
  };
  try {
    const post = await Post.updateOne(
      {
        _id: data.id,
      },
      data
    );
    if (post.matchedCount > 0) {
      res.status(200).json(result(1, "UpdateData Success", post));
    } else {
      res.status(200).json(result(0, "Update Data Failed", post));
    }
  } catch (error) {
    res.status(500).json(result(0, error.message));
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.deleteOne({
      _id: req.params.id,
    });
    if (post.deletedCount > 0) {
      res.status(200).json(result(1, "Delete Data Success", post));
    } else {
      res.status(200).json(result(0, "Delete Data Failed", post));
    }
  } catch (error) {
    res.status(500).json(result(0, error.message));
  }
});

module.exports = router;
