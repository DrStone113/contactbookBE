const express = require("express");
const { z } = require("zod");

const contactsController = require("../controllers/contacts.controller");
const { methodNotAllowed } = require("../controllers/errors.controller");
const { validateRequest } = require("../middlewares/validator.middleware");
const { avatarUpload } = require("../middlewares/avatar-upload.middleware");
const {
  contactSchema,
  partialContactSchema,
} = require("../schemas/contact.schemas");

const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/contacts", router);

  router.get(
    "/",
    validateRequest(
      z.object({
        input: z
          .object({
            name: z.string().max(255).optional(),
            favorite: z.enum(["true", "false"]).optional(),
            page: z.coerce.number().nonnegative().default(1),
            limit: z.coerce.number().nonnegative().default(5),
          })
          .strict(),
      })
    ),
    contactsController.getContactsByFilter
  );

  router.post(
    "/",
    [
      avatarUpload,
      validateRequest(
        z.object({
          input: contactSchema.omit({ id: true, avatar: true }).strict(),
        })
      ),
    ],
    contactsController.createContact
  );
  router.delete("/", contactsController.deleteAllContacts);
  router.all("/", methodNotAllowed);

  router.get(
    "/:id",
    validateRequest(
      z.object({
        input: contactSchema.pick({ id: true }).strict(),
      })
    ),
    contactsController.getContact
  );

  router.put(
    "/:id",
    [
      avatarUpload,
      validateRequest(
        z.object({
          input: partialContactSchema
            .omit({ avatar: true })
            .strict()
            .refine(
              ({ name, email, address, phone, favorite, avatarFile }) => {
                return (
                  name ||
                  email ||
                  address ||
                  phone ||
                  favorite !== undefined ||
                  avatarFile
                );
              },
              {
                message: "At least one of the fields must be provided",
              }
            ),
        })
      ),
    ],
    contactsController.updateContact
  );

  router.delete(
    "/:id",
    validateRequest(
      z.object({
        input: contactSchema.pick({ id: true }).strict(),
      })
    ),
    contactsController.deleteContact
  );
  router.all("/:id", methodNotAllowed);
};
