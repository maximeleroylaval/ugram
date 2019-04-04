const logger = require('../common/logger');

const service = require('../services/users');
const pagination = require('../services/pagination');
const auth = require('../services/auth');
const CommentModel = require('../models/comment');
const UserModel = require('../models/user');
const TokenModel = require('../models/token');
const PictureModel = require('../models/picture');
const TagModel = require('../models/tag');
const MentionModel = require('../models/mention');
const LikeModel = require('../models/like');
const NotificationModel = require('../models/notifications');

const multiparty = require('multiparty');
const path = require('path');

// Gets all the users
exports.getUsers = (req, res, next) => {
    logger.log('info', "[REQUEST : GET USERS] TRYING GET USERS.", {tags: 'request,get'});
    UserModel.findAll().then(users => {
        users.forEach(user => {
            UserModel.formatToClient(user);
        })
        return auth.sendSuccess(
            res,
            pagination.formatPagination(users, req.query.page, req.query.perPage),
            200
        );
    });
};

// Gets a specific user
exports.getUser = (req, res, next) => {
    logger.log('info', "[REQUEST : GET  ONE USER] TRYING GET USER.", {tags: 'request,get'});
    UserModel.findByPk(req.params.userId).then(user => {
        UserModel.formatToClient(user);
        return auth.sendSuccess(res, user, 200);
    }).catch(err => {
        return auth.sendError(res, "User '" + req.params.userId + "' does not exist.", 404)
    });
};

// Edits the fields of a specific user
exports.editUser = (req, res, next) => {
    logger.log('info', "[REQUEST : EDIT  ONE USER] TRYING EDIT USER.", {tags: 'request,post'});
    auth.isAuthenticated(req).then(user => {
        user.update({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber
        }).then(() => {
            return auth.sendSuccess(res, { message: "User updated"}, 201);
        })
            .catch(err => {
                return auth.sendError(res, err, 500);
            });
    }).catch(err => {
        return auth.sendError(res, err.message, err.code);
    });
};


exports.createUser = (req, res, next) => {
    logger.log('info', "[REQUEST : CREATE  ONE USER] TRYING CREATE USER.", {tags: 'request,post'});
    // Create the user
    UserModel.create(
        {
            id: req.body.id,
            email : req.body.email,
            password : req.body.password,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            phoneNumber : req.body.phoneNumber
        })
        .then(user => {
            TokenModel.create({
                userId : user.id,
                token: auth.generateToken()
            })
                .then(token => {
                    return auth.sendSuccess(res, {token : token.token}, 201);
                })
                .catch(err => {
                    return auth.sendError(res, err.errors[0].message, 400);
                });
        })
        .catch(err => {
            if (err.errors[0].path === "password")
                err.errors[0].message = "Missing field 'password'";
            if (err.errors[0].path === "PRIMARY")
                err.errors[0].message = "Id is already taken";
            if (err.errors[0].path === "email")
                err.errors[0].message = "Email is already taken";
            return auth.sendError(res, err.errors[0].message, 400);
        });
};

exports.deleteUser = (req, res, next) => {
    logger.log('info', "[REQUEST : DELETE  ONE USER] TRYING DELETE USER.", {tags: 'request,delete'});
    auth.isAuthenticated(req).then(user => {
        return user.destroy();
    })
        .then(() => {
            return auth.sendSuccess(res, null, 200);
        })
        .catch(err => {
            return auth.sendError(res, err, 401);
        });
};

// Gets the pictures of a user
exports.getUserPictures = (req, res, next) => {

    UserModel.findByPk(req.params.userId).then(user => {
        if (user === null) {
            return auth.sendError(res, "User '" + req.params.userId + "' does not exist.", 404)
        } else {
            logger.log('info', "[REQUEST : GET USER PICTURES] TRYING GET USER PICTURES.", {tags: 'request,get'});
            PictureModel.findAll({
                where: {
                    userId: req.params.userId
                },
                order: [
                    ['created', 'DESC']
                ]
            }).then(pictures => {
                let ids = [];
                pictures.forEach(picture => {
                    ids.push(picture.id);
                });
                TagModel.findAll({
                    where: {
                        pictureId: ids
                    },
                    order: [
                        ['id', 'ASC']
                    ]
                }).then(tags => {
                    MentionModel.findAll({
                        where: {
                            pictureId: ids
                        },
                        order: [
                            ['id', 'ASC']
                        ]
                    }).then(mentions => {
                        pictures.forEach(picture => {
                            let finalTags = [];
                            tags.forEach(tag => {
                                if (tag.pictureId == picture.id) {
                                    finalTags.push(tag);
                                }
                            });
                            let finalMentions = [];
                            mentions.forEach(mention => {
                                if (mention.pictureId == picture.id) {
                                    finalMentions.push(mention);
                                }
                            });
                            PictureModel.formatToClient(picture, finalMentions, finalTags);
                        })
                        return auth.sendSuccess(
                            res,
                            pagination.formatPagination(pictures, req.query.page, req.query.perPage),
                            200
                        );
                    }).catch(err => {
                        return auth.sendError(res, err, 500);
                    });
                }).catch(err => {
                    return auth.sendError(res, err, 500);
                });
            }).catch(err => {
                return auth.sendError(res, err, 500);
            });
        }
    }).catch(err => {
        return auth.sendError(res, "User '" + req.params.userId + "' does not exist.", 404)
    });
};

// Uploads a picture for a user
exports.addUserPicture = (req, res, next) => {
    logger.log('info', "[REQUEST : ADD  ONE PICTURE USER] TRYING ADD PICTURE USER.", {tags: 'request,post'});
    auth.isAuthenticated(req).then(user => {
        var form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {
            if (files && files.file && fields.description && fields.tags && fields.mentions) {
                const extension = path.extname(files.file[0].originalFilename);
                PictureModel.create({
                    description : fields.description[0],
                    extension : extension,
                    userId : user.id,
                }).then(picture => {
                    let tags = [];
                    fields.tags.forEach(tag => {
                        const nestedTags = tag.split(",");
                        nestedTags.forEach(nestedTag => {
                            tags.push({ value: nestedTag, pictureId: picture.id });
                        });
                    })
                    TagModel.bulkCreate(tags).then(tags => {
                        let mentions = [];
                        fields.mentions.forEach(mention => {
                            const nestedMentions = mention.split(",");
                            nestedMentions.forEach(nestedMention => {
                                mentions.push({ userId: nestedMention, pictureId: picture.id });
                            });
                        })
                        MentionModel.bulkCreate(mentions).then(mentions => {
                            files.file[0].originalFilename = picture.id + extension;
                            const errCallback = (err) => {
                                return auth.sendError(res, 'Cannot upload file', 500);
                            }
                            const succCallback = (url) => {
                                return auth.sendSuccess(res, {id: picture.id}, 200);
                            }
                            service.addUserPicture(req.params.userId, fields, files.file[0], errCallback, succCallback);
                        }).catch(err => {
                            return auth.sendError(res, 'Cannot insert mentions', 500);
                        })
                    }).catch(err => {
                        return auth.sendError(res, 'Cannot insert tags', 500);
                    });
                }).catch(err => {
                    return auth.sendError(res, err, 500);
                });
            } else {
                return auth.sendError(res, 'Missing fields', 400);
            }
        });
    }).catch(err => {
        return auth.sendError(res, err.message, err.code);
    });
};

// Gets a single picture
exports.getUserPicture = (req, res, next) => {
    logger.log('info', "[REQUEST : GET ONE PICTURE] TRYING GET ONE PICTURE.", {tags: 'request,get'});
    PictureModel.findByPk(req.params.pictureId).then(picture => {
        if (isNaN(req.params.pictureId)) {
            return auth.sendError(res, "Provided type for pictureId is invalid.", 400)
        }
        if (picture === null ||picture.userId !== req.params.userId) {
            return auth.sendError(res, "Picture '" + req.params.pictureId + "' does not exist for user '" + req.params.userId + "'.", 404);
        } else {
            MentionModel.findAll({
                where: {
                    pictureId: picture.id
                }
            }).then(mentions => {
                TagModel.findAll({
                    where: {
                        pictureId: picture.id
                    }
                }).then(tags => {
                    PictureModel.formatToClient(picture, mentions, tags);
                    return auth.sendSuccess(res, picture, 200);
                }).catch(err => {
                    // Server error
                    return auth.sendError(res, err, 500);
                })
            }).catch(err => {
                // Server error
                return auth.sendError(res, err, 500);
            });
        }
    }).catch(err => {
        return auth.sendError(res, "Missing parameter", 400);
    })
};

// Edits the fields of a picture for a user
exports.editUserPicture = (req, res, next) => {
    logger.log('info', "[REQUEST : EDIT USER PICTURE] TRYING EDIT ONE PICTURE.", {tags: 'request,put'});
    auth.isAuthenticated(req).then(user => {
        if (isNaN(req.params.pictureId)) {
            return auth.sendError(res, "Provided type for pictureId is invalid.", 400)
        }
        PictureModel.findByPk(req.params.pictureId).then(picture => {
            if (req.params.userId !== picture.userId) {
                return auth.sendError(res, "Picture '" + req.params.pictureId + "' does not exist for user '" + req.params.userId + "'.", 404)
            }
            if (req.body.description === null ||req.body.tags === null || req.body.mentions === null) {
                return auth.sendError(res, "Missing parameter", 400)
            }
            PictureModel.update(
                {
                    description : req.body.description
                },
                {
                    where: {
                        id: req.params.pictureId
                    }
                }
            ).then(() => {
                let tags = [];
                req.body.tags.forEach(tag => {
                    tags.push({ value: tag, pictureId: picture.id });
                })
                TagModel.destroy({
                    where: {
                        pictureId: picture.id
                    }
                }).then(() => {
                    TagModel.bulkCreate(tags).then(tags => {
                        let mentions = [];
                        req.body.mentions.forEach(mention => {
                            mentions.push({ userId: mention, pictureId: picture.id });
                        })
                        MentionModel.destroy({
                            where : {
                                pictureId: picture.id
                            }
                        }).then(() => {
                            MentionModel.bulkCreate(mentions).then(mentions => {
                                PictureModel.formatToClient(picture, mentions, tags);
                                return auth.sendSuccess(res, picture, 201);
                            }).catch(err => {
                                return auth.sendError(res, err, 500);
                            })
                        }).catch(err => {
                            return auth.sendError(res, err, 500);
                        });
                    }).catch(err => {
                        return auth.sendError(res, err, 500);
                    });
                }).catch(err => {
                    return auth.sendError(res, err, 500);
                });
            }).catch(err => {
                return auth.sendError(res, "Missing parameter", 400);
            })
        }).catch(err => {
            return auth.sendError(res, "Picture '" + req.params.pictureId + "' does not exist for user '" + req.params.userId + "'.", 404);
        })
    }).catch(err => {
        return auth.sendError(res, err.message, err.code);
    });
};

// Deletes a picture for a user
exports.deleteUserPicture = (req, res, next) => {
    logger.log('info', "[REQUEST : DELETE USER PICTURE] TRYING DELETE ONE PICTURE.", {tags: 'request,delete'});
    auth.isAuthenticated(req).then(user => {
        if (isNaN(req.params.pictureId)) {
            return auth.sendError(res, "Provided type for pictureId is invalid.", 400)
        }
        PictureModel.findByPk(req.params.pictureId).then(picture => {
            if (req.params.userId !== picture.userId) {
                return auth.sendError(res, "Picture '" + req.params.pictureId + "' does not exist for user '" + req.params.userId + "'.", 404)
            }
            const errCallback = (err) => {
                return auth.sendError(res, 'Unable to delete the specified file', 401);
            };
            const succCallback = () => {
                PictureModel.destroy({
                    where: {
                        id: picture.id
                    }
                }).then(() => {
                    return auth.sendSuccess(res, null, 204);
                })
                    .catch(err => {
                        return auth.sendError(res, err, 500);
                    });
            };
            service.deleteUserPicture(picture.userId, picture.id + picture.extension, errCallback, succCallback);
        }).catch(err => {
            return auth.sendError(res, "Picture '" + req.params.pictureId + "' does not exist for user '" + req.params.userId + "'.", 404);
        })
    }).catch(err => {
        return auth.sendError(res, err.message, err.code);
    });
};

// Deletes all pictures for a user
exports.deleteUserPictures = (req, res, next) => {
    logger.log('info', "[REQUEST : DELETE USER PICTURES] TRYING DELETE ALL PICTURES.", {tags: 'request,delete'});
    auth.isAuthenticated(req).then(user => {
        PictureModel.findAll({
            where : {
                userId: user.id
            }
        }).then(pictures => {
            if (!auth.isDefined(pictures)) {
                throw "No pictures"
            }
            const errCallback = (err) => {
                return auth.sendError(res, 'Unable to delete files for user ' + user.id, 501);
            };
            const succCallback = () => {
                PictureModel.destroy({
                    where: {
                        userId: user.id
                    }
                }).then(() => {
                    return auth.sendSuccess(res, null, 204);
                })
                    .catch(err => {
                        return auth.sendError(res, err, 500);
                    });
            };
            pictureNames = [];
            pictures.forEach(picture => {
                pictureNames.push(picture.id + picture.extension)
            });
            service.deleteUserPictures(user.id, pictureNames, errCallback, succCallback);
        }).catch(err => {
            return auth.sendError(res, "No pictures found for user '" + user.id + "'.", 204);
        })
    }).catch(err => {
        return auth.sendError(res, err.message, err.code);
    });
};

exports.deleteUserComment = (req, res, next) => {
    let socket = req.app.get('socket');
    auth.isAuthenticated(req).then(user => {
        CommentModel.find({
            where : {
                id: req.params.id,
                pictureId: req.params.pictureId
            }
        }).then(comment => {
            NotificationModel.destroy({
                where: {
                    userId: comment.ownerId
                }
            });
            CommentModel.destroy({
                where: {
                    id: comment.id,
                    pictureId: comment.pictureId
                }
            }).then(() => {
                socket.emit('GET_COMMENTS');
                return auth.sendSuccess(res, null, 204);
            })
                .catch(err => {
                    return auth.sendError(res, err, 500);
                });
        }).catch(err => {
            return auth.sendError(res, "No pictures found for user '" + user.id + "'.", 204);
        })
    }).catch(err => {
        return auth.sendError(res, err.message, err.code);
    });
};


exports.addComment = (req, res, next) => {
    let socket = req.app.get('socket');
    CommentModel.create(
        {
            userId: req.params.userId,
            pictureId : req.params.pictureId,
            message : req.body.message,
            ownerId : req.body.ownerId,
        })
        .then(comment => {
            socket.emit('GET_COMMENTS');
            if (req.params.userId !== req.body.ownerId) {
                NotificationModel.create({
                        userId: req.body.ownerId,
                        url: '/profil/' + req.body.ownerId + '?search=' + req.params.pictureId,
                        message: req.params.userId + ' a commenté votre photo'
                    }
                );
            }
            socket.emit(req.body.ownerId);
            return auth.sendSuccess(res, {comment}, 200);
        })
        .catch(err => {
            return auth.sendError(res, err.errors[0].message, 400);
        });
};
exports.getNotifications = (req, res, next) => {
    NotificationModel.findAll({ where: {
            userId: req.params.userId
        }}).then(notifications => {
        return auth.sendSuccess(res, notifications, 200);
    })
        .catch(err => {
            return auth.sendError(res, err, 400);
        });
};


exports.addLike = (req, res, next) => {
    let socket = req.app.get('socket');
    LikeModel.create(
        {
            userId: req.params.userId,
            pictureId : req.params.pictureId,
            ownerId : req.body.ownerId
        })
        .then(comment => {
            socket.emit('GET_LIKES');
            if (req.params.userId !== req.body.ownerId) {
                NotificationModel.create({
                        userId: req.body.ownerId,
                        url: '/profil/' + req.body.ownerId + '?search=' + req.params.pictureId,
                        message: req.params.userId + ' a aimé votre photo'
                    }
                );
            }
            socket.emit(req.body.ownerId);
            return auth.sendSuccess(res, {comment}, 200);
        })
        .catch(err => {
            return auth.sendError(res, err.errors[0].message, 400);
        });
};

exports.deleteUserLike = (req, res, next) => {
    let socket = req.app.get('socket');
    auth.isAuthenticated(req).then(user => {
        LikeModel.find({
            where : {
                id: req.params.id,
                pictureId: req.params.pictureId
            }
        }).then(comment => {
            NotificationModel.destroy({
                where: {
                    userId: comment.ownerId
                }
            });
            LikeModel.destroy({
                where: {
                    id: comment.id,
                    pictureId: comment.pictureId
                }
            }).then(() => {
                console.log(req.params);
                socket.emit('GET_LIKES');
                return auth.sendSuccess(res, null, 204);
            })
                .catch(err => {
                    return auth.sendError(res, err, 500);
                });
        }).catch(err => {
            return auth.sendError(res, "No pictures found for user '" + user.id + "'.", 204);
        })
    }).catch(err => {
        return auth.sendError(res, err.message, err.code);
    });
};
