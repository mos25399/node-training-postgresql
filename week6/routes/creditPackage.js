const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("CreditPackage");
const { isValidString, isNumber } = require("../utils/validUtils");
const isAuth = require("../middlewares/isAuth");

router.get("/", async (req, res, next) => {
  try {
    const data = await dataSource.getRepository("CreditPackage").find({
      select: ["id", "name", "credit_amount", "price"],
    });
    res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, credit_amount, price } = req.body;
    if (!isValidString(name) || !isNumber(credit_amount) || !isNumber(price)) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
    }

    const creditPackage = dataSource.getRepository("CreditPackage");
    const findCreditPackage = await creditPackage.find({
      where: {
        name: name,
      },
    });
    if (findCreditPackage.length > 0) {
      res.status(409).json({
        status: "failed",
        message: "資料重複",
      });
      return;
    }

    const newCreditPackage = creditPackage.create({
      name,
      credit_amount,
      price,
    });

    const result = await creditPackage.save(newCreditPackage);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.post("/:creditPackageId", isAuth, async (req, res, next) => {
  try {
    const { id } = req.user;
    const { creditPackageId } = req.params;
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const creditPackage = await creditPackageRepo.findOne({
      where: {
        id: creditPackageId,
      },
    });
    if (!creditPackage) {
      res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
      return;
    }
    const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
    const newPurchase = await creditPurchaseRepo.create({
      user_id: id,
      credit_package_id: creditPackageId,
      purchased_credits: creditPackage.credit_amount,
      price_paid: creditPackage.price,
      purchaseAt: new Date().toISOString(),
    });
    await creditPurchaseRepo.save(newPurchase);
    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.delete("/:creditPackageId", async (req, res, next) => {
  try {
    const { creditPackageId } = req.params;

    if (!isValidString(creditPackageId)) {
      res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
      return;
    }

    const result = await dataSource.getRepository("CreditPackage").delete(creditPackageId);
    if (result.affected === 0) {
      res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
      return;
    }
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
