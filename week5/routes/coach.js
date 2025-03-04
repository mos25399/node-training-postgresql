const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Coach");
const { isValidString, isNumber } = require("../utils/validUtils");

router.get("/", async (req, res, next) => {
  try {
    let per = parseInt(req.query.per, 10);
    let page = parseInt(req.query.page, 10);

    if (isNaN(per) || isNaN(page) || per <= 0 || page <= 0) {
      return res.status(400).json({
        status: "failed",
        message: "per 與 page 需為正整數",
      });
    }

    const skip = (page - 1) * per;

    const coachRepo = await dataSource.getRepository("Coach").find({
      select: {
        id: true,
        experience_years: true,
        description: true,
        profile_image_url: true,
        User: {
          name: true,
        },
      },
      take: per,
      skip: skip,
      relations: {
        User: true,
      },
    });

    const coachData = coachRepo.map((coach) => ({
      id: coach.id,
      name: coach.User?.name || "未知名稱",
      experience_years: coach.experience_years,
      description: coach.description,
      profile_image_url: coach.profile_image_url,
    }));

    res.status(200).json({
      status: "success",
      data: coachData,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.get("/:coachId", async (req, res, next) => {
  try {
    const { coachId } = req.params;
    if (!isValidString(coachId)) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
    }
    const coachRepo = await dataSource.getRepository("Coach");
    const findCoach = await coachRepo.findOne({
      where: {
        id: coachId,
      },
      relations: ["User"],
    });
    if (!findCoach) {
      res.status(400).json({
        status: "failed",
        message: "找不到該教練",
      });
      return;
    }

    const resultCoach = {
      user: {
        name: findCoach.User?.name || "未知名稱",
        role: "COACH",
      },
      coach: {
        id: findCoach.id,
        user_id: findCoach.User?.id || null, 
        experience_years: findCoach.experience_years,
        description: findCoach.description,
        profile_image_url: findCoach.profile_image_url,
        created_at: findCoach.created_at,
        updated_at: findCoach.updated_at
      },
    };

    res.status(200).json({
      status: "success",
      data: resultCoach,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;