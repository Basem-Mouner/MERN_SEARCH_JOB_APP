// Pagination requires:
// Page number (page)
// Number of items per page (limit)
// Skipping documents: skip = (page - 1) * limit

// Pagination Function
import * as dbService from "../../DB/db.services.js";

export const paginate = async ({
  model,
  page = process.env.PAGE,
  limit = process.env.LIMIT,
  filter = {},
  populate = [],
  select = "",
  sort={}
} = {}) => {
  page = parseInt(page > 0 ? page : 1);
  limit = parseInt(limit < 0 ? 1 : limit);
  const skip = (page - 1) * limit;

  const data = await dbService.findAll({
    model,
    filter,
    populate,
    select,
    skip,
    limit,
    sort
  });
 const totalCount = await model.countDocuments(filter);
  return {
    data,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalItems: totalCount,
  };
};
