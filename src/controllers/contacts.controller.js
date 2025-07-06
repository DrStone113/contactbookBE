const contactsService = require("../services/contacts.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

const DEFAULT_AVATAR = "/public/images/blank-profile-picture.png";

function getAvatarUrlPath(file) {
  return file ? `/public/uploads/${file.filename}` : DEFAULT_AVATAR;
}

async function createContact(req, res, next) {
  try {
    const contactData = {
      ...req.body,
      avatar: getAvatarUrlPath(req.file),
    };
    const contact = await contactsService.createContact(contactData);
    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${contact.id}`,
      })
      .json(
        JSend.success({
          contact,
        })
      );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

async function getContactsByFilter(req, res, next) {
  let result = {
    contact: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await contactsService.getManyContacts(req.query);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }

  return res.json(
    JSend.success({
      contacts: result.contacts,
      metadata: result.metadata,
    })
  );
}

async function getContact(req, res, next) {
  const { id } = req.params;

  try {
    const contact = await contactsService.getContactById(id);
    if (!contact) {
      return next(new ApiError(404, "Contact not found"));
    }
    return res.json(JSend.success({ contact }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

async function updateContact(req, res, next) {
  const { id } = req.params;

  try {
    const updateData = {
      ...req.body,
      ...(req.file && { avatar: getAvatarUrlPath(req.file) }),
    };

    const updated = await contactsService.updateContact(id, updateData);
    if (!updated) {
      return next(new ApiError(404, "Contact not found"));
    }

    return res.json(
      JSend.success({
        contact: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

async function deleteContact(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await contactsService.deleteContact(id);
    if (!deleted) {
      return next(new ApiError(404, "Contact not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

async function deleteAllContacts(req, res, next) {
  try {
    await contactsService.deleteAllContacts();

    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Internal Server Error"));
  }
}

module.exports = {
  getContactsByFilter,
  deleteAllContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
};
