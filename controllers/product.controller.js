import {
  fileUpload,
  INTERNAL_SERVER_ERROR,
  SOMTHING_WENT_WRONG,
  SUCCESS,
} from "../constant.js";
import productModel from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  BAD_REQUEST,
  INTERNAL_SERVER,
  NOT_FOUND,
  OK,
} from "../utils/httpStatusCode.js";
import {
  getCartsProductsSchema,
  getproductSchema,
  productValidation,
} from "../validation/product.validation.js";

const addProduct = asyncHandler(async (req, res) => {
  try {
    const images = req?.files?.images;

    if (!images || images.length < 1) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "images is required"));
    }

    const validation = productValidation.validate(req.body);

    if (validation.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validation.error.message));
    }

    const data = await fileUpload(images, "products");

    const result = await productModel.create({ ...req.body, images: data });

    if (!result) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, SOMTHING_WENT_WRONG));
    }

    return res.status(OK).json(new ApiResponse(OK, SUCCESS));
  } catch (error) {
    console.log(error);
    return res
      .status(INTERNAL_SERVER)
      .json(
        new ApiResponse(
          INTERNAL_SERVER,
          INTERNAL_SERVER_ERROR,
          {},
          error.message
        )
      );
  }
});

const getProducts = asyncHandler(async (req, res) => {
  try {
    const validation = getproductSchema.validate(req.body);

    if (validation.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validation.error.message));
    }

    const {
      page = 1,
      limit = 5,
      sort = "-createdAt",
      fields,
      search,
      category,
      brands,
      price,
      rating,
    } = req.body;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Query
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = { $in: category };
    }
    if (brands) {
      query.brand = { $in: brands };
    }
    if (price && !price.includes("max")) {
      const [priceMin, priceMax] = price.split("-").map(Number);
      query.price = { $gte: priceMin, $lte: priceMax };
    } else if (price && price.includes("max")) {
      const [priceMin, priceMax] = price.split("-").map(Number);
      query.price = { $gte: priceMin };
    }
    if (rating) {
      query.rating = { $in: rating };
    }

    const totalCount = await productModel.countDocuments(query);

    const result = await productModel
      .find(query)
      .skip(skip)
      .limit(limitNumber)
      .sort(sort)
      .select(fields ? fields : "-__v");

    // if (skip >= totalCount && pageNumber > 1) {
    //   return res
    //     .status(400)
    //     .send({ message: "This page does not exist", status: false });
    // }

    return res
      .status(OK)
      .json(new ApiResponse(OK, SUCCESS, { result, totalCount }));
  } catch (error) {
    console.log(error);
    return res
      .status(INTERNAL_SERVER)
      .json(
        new ApiResponse(
          INTERNAL_SERVER,
          INTERNAL_SERVER_ERROR,
          {},
          error.message
        )
      );
  }
});

const getBrandAndCategoryFilter = asyncHandler(async (req, res) => {
  try {
    let category = await productModel.distinct("category");
    let brand = await productModel.distinct("brand");
    if (!brand || !category) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, SOMTHING_WENT_WRONG));
    }
    let data = {
      category,
      brand,
    };
    res.status(OK).json(new ApiResponse(OK, SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res
      .status(INTERNAL_SERVER)
      .json(
        new ApiResponse(INTERNAL_SERVER, INTERNAL_SERVER, {}, error.message)
      );
  }
});

const getProductById = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.params;

    if (!_id) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "Id is required"));
    }

    const result = await productModel.findOne({ _id });

    if (!result) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, SOMTHING_WENT_WRONG));
    }

    return res.status(OK).json(new ApiResponse(OK, SUCCESS, result));
  } catch (error) {
    console.log(error);
    return res
      .status(INTERNAL_SERVER)
      .json(
        new ApiResponse(
          INTERNAL_SERVER,
          INTERNAL_SERVER_ERROR,
          {},
          error.message
        )
      );
  }
});

const getCartProducts = asyncHandler(async (req, res) => {
  try {
    const validateIds = getCartsProductsSchema.validate(req.body);
    if (validateIds.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validateIds.error.message));
    }
    const { productsIds } = req.body;
    const result = await productModel.find({ _id: { $in: productsIds } });
    if (!result) {
      return res
        .status(NOT_FOUND)
        .json(new ApiResponse(NOT_FOUND, SOMTHING_WENT_WRONG));
    }
    return res.status(OK).json(new ApiResponse(OK, SUCCESS, result));
  } catch (error) {
    console.log(error);
    return res
      .status(INTERNAL_SERVER)
      .json(
        new ApiResponse(
          INTERNAL_SERVER,
          INTERNAL_SERVER_ERROR,
          {},
          error.message
        )
      );
  }
});

export {
  addProduct,
  getBrandAndCategoryFilter,
  getProductById,
  getProducts,
  getCartProducts,
};

//  const getProducts = async (req, res) => {
//     try {
//         const page = Number(req?.query?.page) || 1
//         const limit = Number(req?.query?.limit) || 5
//         const skip = (page - 1) * limit
//         // const result = await productModel.find().skip(skip).limit(limit).populate({ path: "category", select: "category" });
//         const result = await productModel.find().skip(skip).limit(limit)
//         if (!result) return res.status(400).send({ message: SOMTHING_WENT_WRONG, status: false })
//         const totalCount = await productModel.countDocuments()
//         return res.status(200).send({ message: SUCCESS, data: { result, totalCount }, status: true })
//     } catch (error) {
//         console.log(error)
//         return res.status(500).send({ message: INTERNAL_SERVER_ERROR, error: error.message, status: false })
//     }
// }

//  const ProductsFilteredData = async (req, res) => {
//     try {
//         const queryObj = { ...req.body }
//         const excludesFields = ['page', 'sort', 'limit', 'fields']
//         excludesFields.forEach(x => delete queryObj[x])
//         let queryStr = JSON.stringify(queryObj)
//         queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

//         let query = productModel.find()

//         // Sorting
//         if (req.body.search) {
//             const search = req.body.search
//             query = query.find({ title: { $regex: search, $options: 'i' } })
//         }

//         // Sorting
//         if (req.body.sort) {
//             const sortBy = req.body.sort
//             query = query.sort(sortBy)
//         } else {
//             query = query.sort('-createdAt')
//         }

//         // filter category
//         if (req.body.category) {
//             const category = req.body.category
//             query = query.where("category").in(category)
//         }

//         // filter brands
//         if (req.body.brands) {
//             const brands = req.body.brands
//             query = query.where("brands").in(brands)
//         }

//         // filter price
//         if (req.body.price) {
//             const price = req.body.price.split('-')
//             query = query.gte('price', price[0]).lte('price', price[1])
//         }

//         // filter ratings
//         if (req.body.ratings) {
//             const ratings = req.body.ratings
//             query = query.where('rating').in(ratings)
//         }

//         // limiting the fields
//         if (req.body.fields) {
//             const fields = req.body.fields
//             query = query.select(fields)
//         } else {
//             query = query.select('-__v')
//         }

//         // pagination
//         let page = req.body.page
//         let limit = req.body.limit
//         let skip = (page - 1) * limit

//         query = query.skip(skip).limit(limit)
//         if (req.body.page) {
//             const productCount = await productModel.countDocuments()
//             if (skip >= productCount) return res.status(400).send({ message: "This page does not exists" })
//         }

//         const result = await query
//         return res.status(200).send({ message: SUCCESS, status: true, data: result })
//     } catch (error) {
//         console.log(error)
//     }
// }

//  const ProductsFilteredData = async (req, res) => {
//     try {
//         const queryObj = { ...req.query }
//         const excludesFields = ['page', 'sort', 'limit', 'fields']
//         excludesFields.forEach(x => delete queryObj[x])
//         let queryStr = JSON.stringify(queryObj)
//         queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

//         let query = productModel.find()

//         // Sorting
//         if (req.query.search) {
//             const search = req.query.search
//             query = query.find({ title: { $regex: search, $options: 'i' } })
//         }

//         // Sorting
//         if (req.query.sort) {
//             const sortBy = req.query.sort.split(',').join(' ')
//             query = query.sort(sortBy)
//         } else {
//             query = query.sort('-createdAt')
//         }

//         // filter category
//         if (req.query.category) {
//             const category = req.query.category.split(',')
//             query = query.where("category").in(category)
//         }

//         // filter brands
//         if (req.query.brands) {
//             const brands = req.query.brands.split(',')
//             query = query.where("brands").in(brands)
//         }

//         // filter price
//         if (req.query.price) {
//             const price = req.query.price.split('-')
//             query = query.gte('price', price[0]).lte('price', price[1])
//         }

//         // filter ratings
//         if (req.query.ratings) {
//             const ratings = req.query.ratings
//             query = query.where('rating').in(ratings)
//         }

//         // limiting the fields
//         if (req.query.fields) {
//             const fields = req.query.fields.split(',').join(' ')
//             query = query.select(fields)
//         } else {
//             query = query.select('-__v')
//         }

//         // pagination
//         let page = req.query.page
//         let limit = req.query.limit
//         let skip = (page - 1) * limit

//         query = query.skip(skip).limit(limit)
//         if (req.query.page) {
//             const productCount = await productModel.countDocuments()
//             if (skip >= productCount) return res.status(400).send({ message: "This page does not exists" })
//         }

//         const result = await query
//         return res.status(200).send({ message: SUCCESS, status: true, data: result })
//     } catch (error) {
//         console.log(error)
//     }
// }
