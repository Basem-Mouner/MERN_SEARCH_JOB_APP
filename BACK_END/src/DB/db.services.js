// Create a document
export const create = async ({ model, data = {} } = {}) => {
  const document = await model.create(data);
  return document;
};

// Bulk write operations
export const bulkWrite = async ({ model, operations = [] } = {}) => {
    const result = await model.bulkWrite(operations);
    return result;
};

// Insert multiple documents
export const insertMany = async ({ model, data = [] } = {}) => {
    const documents = await model.insertMany(data);
    return documents;
};

// Count documents matching a query
export const count = async ({ model, filter = {} } = {}) => {
    const count = await model.countDocuments(filter);
    return count;
};

// Find multiple documents by a query
export const findOne = async ({
  model,
  filter = {},
  projection = null,
  options = {},
  select = "",
  populate = [],
} = {}) => {
  const documents = await model
    .findOne(filter, projection, options)
    .select(select)
    .populate(populate);

  return documents;
};
// Find multiple documents by a query
export const findAll = async ({
  model,
  filter = {},
  projection = null,
  options = {},
  select = "",
  populate = [],
  skip = 0,
  limit = 1000,
  sort={}
} = {}) => {
  const documents = await model
    .find(filter, projection, options)
    .select(select)
    .populate(populate)
    .skip(skip)
    .limit(limit)
    .sort(sort);
    
  return documents;
};
// Find a document by ID
export const findById = async ({
  model,
  id,
  projection = null,
  options = {},
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .findById(id, projection, options)
    .select(select)
    .populate(populate);

  return document;
};

// Find one document and update it
export const findOneAndUpdate = async ({ model, filter = {}, updateData = {}, options = {},select = "",
  populate = [], } = {}) => {
    const document = await model
      .findOneAndUpdate(filter, updateData, {
        new: true, // Return the updated document by default
        ...options, // Spread additional options (e.g., upsert)
      })
      .select(select)
      .populate(populate);
    return document;
};
// Find a document by ID and update it
export const findByIdAndUpdate = async ({
  model,
  id,
  updateData = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      ...options,
    })
    .select(select)
    .populate(populate);;
  return document;
};

// Update a single document by a query
export const updateOne = async ({
  model,
  filter = {},
  updateData = {},
  options = {},
} = {}) => {
  const document = await model.updateOne(filter, updateData, options);
  return document;
};

// Update multiple documents by a query
export const updateMany = async ({
  model,
  filter = {},
  updateData = {},
  options = {},
} = {}) => {
  const documents = await model.updateMany(filter, updateData, options);
  return documents;
};



// Delete one document by a query
export const deleteOne = async ({
  model,
  filter = {},

} = {}) => {
  const document = await model.findOneAndDelete(filter)
   
  return document;
};

// Delete multiple documents by a query
export const deleteMany = async ({ model, filter = {} } = {}) => {
  const documents = await model.deleteMany(filter);
  return documents; // Returns a result object, not documents
};

export const findOneAndDelete = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .findOneAndDelete(filter) // Deletes the matching document
    .select(select) // Select specific fields from the result
    .populate(populate); // Populate references if needed
  return document;
};


// Delete a document by ID
export const findByIdAndDelete = async ({
  model,
  id,
  select = "",
  populate = [],
} = {}) => {
  const document = await model
    .findByIdAndDelete(id)
    .select(select)
    .populate(populate);
  return document;
};

// Soft delete (sets an "isDeleted" field instead of removing)
export const softDeleteOne = async ({
  model,
  filter = {},
  options = {},
  select = "",
  populate = [],
  deletedField = "isDeleted", // Name of the field marking deletion
} = {}) => {
  const document = await model
    .findOneAndUpdate(filter, { $set: { [deletedField]: true } }, {
      new: true, // Return the updated document
      ...options,
    })
    .select(select)
    .populate(populate);
  return document;
};

// Soft delete multiple documents
export const softDeleteMany = async ({
  model,
  filter = {},
  options = {},
  deletedField = "isDeleted",
} = {}) => {
  const result = await model.updateMany(filter, { $set: { [deletedField]: true } }, options);
  return result;
};
