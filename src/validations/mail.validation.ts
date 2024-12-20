import Joi from "joi";

const addNewMailSchema = Joi.object({
  addressees: Joi.array().items(Joi.string().required()).min(1).required(),
  organization: Joi.string().required(),
  referenceNumber: Joi.string().required(),
});

const editMailSchema = Joi.object({
  addressees: Joi.array().items(Joi.string().required()).min(1),
  organization: Joi.string(),
  referenceNumber: Joi.string(),
});

const dispatchMailSchema = Joi.object({
  driverId: Joi.string().uuid().required(),
  mailIds: Joi.array().items(Joi.string().uuid().required()).min(1).required(),
});

const receiveMailSchema = Joi.object({
  receipient: Joi.string().required(),
  receipientContact: Joi.string().max(10).required(),
  receipientSignatureUrl: Joi.string().required(),
});

const addNewDriverSchema = Joi.object({
  name: Joi.string().required(),
  contact: Joi.string().required(),
});

const deleteDriverSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().uuid().required()).min(1).required(),
});

export {
  addNewMailSchema,
  dispatchMailSchema,
  receiveMailSchema,
  addNewDriverSchema,
  editMailSchema,
  deleteDriverSchema,
};
